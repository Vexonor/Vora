import { Injectable } from "@nestjs/common";
import sequelize, { Op } from "sequelize";

@Injectable()
export class QueryBuilderHelper {
  protected query: any;
  protected model;
  public relation = [];
  protected customField = [];
  protected groupByField = [];
  protected join = [];
  public condition;
  protected extraOptions;
  public subQuery = true;
  protected isSubQueryManually = false;
  protected runCount = true;
  protected countColumn = "id";
  protected primaryKeys = [];
  private readonly UNFILTERABLE_FIELDS = [
    "order_by",
    "direction",
    "page",
    "limit",
    "filter_date_start",
    "filter_date_end",
    "filter_date_field",
    "filter_range_start",
    "filter_range_end",
    "filter_range_field",
    "q",
    "with_filter",
  ];

  constructor(model, query) {
    // decode url query
    this.query = query;
    this.model = model;
  }

  public async getResult() {
    const result: any = {};
    const filter = this.filter(this.query);
    const filterLength = Object.keys(filter).length + Object.getOwnPropertySymbols(filter).length;

    if (filterLength > 0) {
      result.where = filter;
    }

    const filterDateRange = this.filterDateRange(this.query);
    if (Object.keys(filterDateRange).length > 0) {
      result.where = result.where ? { ...result.where, ...filterDateRange } : filterDateRange;
    }

    const filterRange = this.filterRange(this.query);
    if (Object.keys(filterRange).length > 0) {
      result.where = result.where ? { ...result.where, ...filterRange } : filterRange;
    }

    if (typeof this.condition !== "undefined") {
      result.where = result.where ? { ...result.where, ...this.condition } : this.condition;
    }

    const order = this.orderBy(this.query);
    if (Object.keys(order).length > 0) {
      result.order = order;
    }

    if (typeof this.query.q !== "undefined") {
      const search = this.search(this.query);
      result.where = { ...result.where, ...search };
    }

    if (typeof this.extraOptions !== "undefined") {
      if (typeof this.extraOptions.where !== "undefined") {
        result.where = { ...result.where, ...this.extraOptions.where };
        // to avoid conflict on query
        delete this.extraOptions.where;
      }

      if (typeof this.extraOptions.include !== "undefined") {
        this.relation = this.relation.concat(this.extraOptions.include);
        delete this.extraOptions.include;
        this.checkRelation(this.relation);
      }
    }

    return await this.findWithoutFilter(result);
  }

  private async findWithoutFilter(options) {
    this.remappingWhereCondition(options.where);
    try {
      const paginate = this.paginate(this.query);
      // set this variable to useable as global variable
      this.condition = options.where;

      // Find primary key for count
      this.determineCountColumn();

      const dataPromise = this.model
        .findAll({
          ...options,
          include: this.relation,
          offset: paginate.offset,
          limit: paginate.limit,
          attributes: {
            include: [...this.customField],
          },
          group: [...this.groupByField],
          ...this.extraOptions,
          subQuery: this.subQuery,
        })
        .then((data) => {
          if (data) {
            return data.map((value) => value.get({ plain: true }));
          }
          return data;
        });

      let countPromise = Promise.resolve(0);
      if (this.runCount) {
        let distinct = true;
        if (this.primaryKeys.length > 0) {
          distinct = false;
        }

        countPromise = this.model.count({
          distinct: distinct,
          include: this.relation,
          col: this.countColumn,
          ...options,
        });
      }

      const [count, data] = await Promise.all([countPromise, dataPromise]);

      return { count, data };
    } catch (error) {
      console.error("Error in findWithoutFilter:", error);
      return { count: 0, data: [] };
    }
  }

  private determineCountColumn() {
    const attributes = this.model.getAttributes();
    for (const key in attributes) {
      if (attributes[key].primaryKey) {
        this.countColumn = key;
        this.primaryKeys.push(key);
      }
    }

    if (typeof this.relation === "undefined") {
      this.countColumn = `${this.model.name}.${this.countColumn}`;
    }
  }

  public load(...relations) {
    this.relation = this.buildEagerLoad(relations);
    return this;
  }

  public paginate(query) {
    const paginateAttributes = ["limit", "page"];
    const getPaginate = Object.fromEntries(
      Object.entries(query).filter(([key]) => paginateAttributes.includes(key)),
    );

    const itemPerPage = +getPaginate.limit || 20; // Default 20 item per page
    const rawCurrentPage = +getPaginate.page || 1; // Default page 1

    return {
      offset: itemPerPage * (rawCurrentPage - 1),
      limit: itemPerPage,
    };
  }

  public sum(field, alias = null) {
    if (!alias) {
      alias = "sum_" + field.split(".").pop();
    }
    this.customField.push([sequelize.fn("sum", sequelize.col(field)), alias]);
    return this;
  }

  public where(condition: object) {
    if (typeof this.condition === "undefined") {
      this.condition = {};
    }
    Object.assign(this.condition, condition);
    return this;
  }

  public groupBy(field) {
    this.groupByField.push(field);
    return this;
  }

  public generateRawFilter(query) {
    const result: any = {};

    const filter = this.filter(this.query);
    if (Object.keys(filter).length > 0) {
      result.where = filter;
    }

    const filterDateRange = this.filterDateRange(query);
    if (Object.keys(filterDateRange).length > 0) {
      result.where = result.where ? { ...result.where, ...filterDateRange } : filterDateRange;
    }

    const filterRange = this.filterRange(query);
    if (Object.keys(filterRange).length > 0) {
      result.where = result.where ? { ...result.where, ...filterRange } : filterRange;
    }

    if (typeof this.condition !== "undefined") {
      result.where = result.where ? { ...result.where, ...this.condition } : this.condition;
    }

    if (typeof query.q !== "undefined") {
      const search = this.search(query);
      result.where = { ...result.where, ...search };
    }

    if (typeof this.extraOptions !== "undefined") {
      if (typeof this.extraOptions.where !== "undefined") {
        result.where = { ...result.where, ...this.extraOptions.where };
        // to avoid conflict on query
        delete this.extraOptions.where;
      }

      // check if there is include with where condition
      if (typeof this.extraOptions.include !== "undefined") {
        this.checkRelation(this.extraOptions.include);
      }
    }

    return result.where;
  }

  private checkRelation(relations: Array<string | Record<string, any>>) {
    for (const relation of relations) {
      // check if relation is an object
      if (typeof relation === "object") {
        // check if object contain "where" key
        if (Object.keys(relation).includes("where")) {
          this.isSubQueryManually = true;
          this.subQuery = false;
        }

        if (Object.keys(relation).includes("include")) {
          this.checkRelation(relation.include);
        }
      }
    }
  }

  public filter(query: object) {
    const filter = {};
    const conditions = {
      or: [],
      and: [],
      like: {},
      not: {},
      gt: {},
      gte: {},
      lt: {},
      lte: {},
    };

    Object.entries(query).forEach(([key, value]) => {
      if (this.UNFILTERABLE_FIELDS.includes(key)) {
        return;
      }

      // Parse value if it's a string
      let queryValue;
      if (typeof value === "string") {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            queryValue = parsedValue.map((value) => decodeURI(value));
          } else {
            queryValue = decodeURI(value);
          }
        } catch {
          if (typeof value === "undefined") {
            queryValue = null;
          } else {
            queryValue = decodeURI(value);
          }
        }
      } else if (Array.isArray(value)) {
        queryValue = value.map((value) => decodeURI(value));
      } else {
        queryValue = decodeURI(value);
      }

      // Format the key
      const formattedKey = "$" + key.replace(/-/g, ".") + "$";

      const splitKey = formattedKey.split(".");

      if (splitKey.length > 1 && splitKey[0] !== this.model.tableName) {
        this.isSubQueryManually = true;
        this.subQuery = false;
      }

      // Determine condition type and add to appropriate collection
      if (key.startsWith("_or_")) {
        conditions.or.push({ [formattedKey.replace("_or_", "")]: queryValue });
      } else if (key.startsWith("_like_")) {
        conditions.like[formattedKey.replace("_like_", "")] = queryValue;
      } else if (key.startsWith("_not_")) {
        conditions.not[formattedKey.replace("_not_", "")] = queryValue;
      } else if (key.startsWith("_gt_")) {
        conditions.gt[formattedKey.replace("_gt_", "")] = queryValue;
      } else if (key.startsWith("_gte_")) {
        conditions.gte[formattedKey.replace("_gte_", "")] = queryValue;
      } else if (key.startsWith("_lt_")) {
        conditions.lt[formattedKey.replace("_lt_", "")] = queryValue;
      } else if (key.startsWith("_lte_")) {
        conditions.lte[formattedKey.replace("_lte_", "")] = queryValue;
      } else {
        conditions.and.push({ [formattedKey]: queryValue });
      }
    });

    // Build final filter object
    if (conditions.and.length > 0) filter[Op.and] = conditions.and;
    if (conditions.or.length > 0) filter[Op.or] = conditions.or;

    // Track fields that have multiple conditions
    const fieldConditions = new Map();

    // Process like conditions
    Object.entries(conditions.like).forEach(([key, value]) => {
      if (!fieldConditions.has(key)) {
        fieldConditions.set(key, []);
      }
      fieldConditions.get(key).push({ [Op.like]: value });
    });

    // Process not conditions
    Object.entries(conditions.not).forEach(([key, value]) => {
      if (!fieldConditions.has(key)) {
        fieldConditions.set(key, []);
      }
      fieldConditions.get(key).push({ [Op.not]: value });
    });

    // Process gt conditions
    Object.entries(conditions.gt).forEach(([key, value]) => {
      if (!fieldConditions.has(key)) {
        fieldConditions.set(key, []);
      }
      fieldConditions.get(key).push({ [Op.gt]: value });
    });

    // Process gte conditions
    Object.entries(conditions.gte).forEach(([key, value]) => {
      if (!fieldConditions.has(key)) {
        fieldConditions.set(key, []);
      }
      fieldConditions.get(key).push({ [Op.gte]: value });
    });

    // Process lt conditions
    Object.entries(conditions.lt).forEach(([key, value]) => {
      if (!fieldConditions.has(key)) {
        fieldConditions.set(key, []);
      }
      fieldConditions.get(key).push({ [Op.lt]: value });
    });

    // Process lte conditions
    Object.entries(conditions.lte).forEach(([key, value]) => {
      if (!fieldConditions.has(key)) {
        fieldConditions.set(key, []);
      }
      fieldConditions.get(key).push({ [Op.lte]: value });
    });

    // Add combined conditions to filter
    fieldConditions.forEach((conditions, key) => {
      if (conditions.length === 1) {
        // If only one condition, add it directly
        filter[key] = conditions[0];
      } else {
        // If multiple conditions, combine with Op.and
        filter[key] = { [Op.and]: conditions };
      }
    });

    return filter;
  }

  private filterDateRange(query: any) {
    const filterable = ["filter_date_field"];
    const filter = {};

    for (let index = 0; index < query.filter_date_field?.length || 0; index++) {
      const validateFields = filterable.every((value) => query[value] && query[value][index]);

      if (!validateFields) continue;

      let dateStart;
      let dateEnd;

      if (typeof query.filter_date_start !== "undefined") {
        dateStart = new Date(query.filter_date_start[index]);
      }

      if (typeof query.filter_date_end !== "undefined") {
        dateEnd = new Date(query.filter_date_end[index]);
      }

      const key = "$" + query.filter_date_field[index].replace(/-/g, ".") + "$";

      if (!isNaN(dateStart?.getTime()) && !isNaN(dateEnd?.getTime())) {
        filter[key] = {
          [Op.gte]: dateStart,
          [Op.lte]: dateEnd,
        };
      } else if (!isNaN(dateStart?.getTime())) {
        filter[key] = {
          [Op.gte]: dateStart,
        };
      } else if (!isNaN(dateEnd?.getTime())) {
        filter[key] = {
          [Op.lte]: dateEnd,
        };
      }
    }
    return filter;
  }

  private filterRange(query: any) {
    const filterable = ["filter_range_field"];
    const filter = {};

    for (let index = 0; index < query.filter_range_field?.length || 0; index++) {
      const validateFields = filterable.every((value) => query[value] && query[value][index]);

      if (!validateFields) continue;

      let rangeStart;
      let rangeEnd;

      if (typeof query.filter_range_start !== "undefined") {
        rangeStart = query.filter_range_start[index];
      }

      if (typeof query.filter_range_end !== "undefined") {
        rangeEnd = query.filter_range_end[index];
      }

      const key = "$" + query.filter_range_field[index].replace(/-/g, ".") + "$";

      if (
        typeof rangeStart !== "undefined" &&
        typeof rangeEnd !== "undefined" &&
        !isNaN(rangeStart) &&
        !isNaN(rangeEnd)
      ) {
        filter[key] = {
          [Op.gte]: +rangeStart,
          [Op.lte]: +rangeEnd,
        };
      } else if (typeof rangeStart !== "undefined" && !isNaN(rangeStart)) {
        filter[key] = {
          [Op.gt]: +rangeStart,
        };
      } else if (typeof rangeEnd !== "undefined" && !isNaN(rangeEnd)) {
        filter[key] = {
          [Op.lt]: +rangeEnd,
        };
      }
    }

    return filter;
  }

  private search(query: object) {
    const getSearch = Object.fromEntries(Object.entries(query).filter(([key]) => key === "q"));

    // get model attributes
    const attributes =
      this.model.searchable ||
      Object.keys(this.model.tableAttributes).map((value) => this.model.tableName + "." + value);

    const result = {};

    attributes.forEach((value) => {
      result["$" + value + "$"] = { [Op.like]: "%" + getSearch.q + "%" };
    });

    // if result contain key
    if (Object.keys(result).length > 0) {
      for (const key in result) {
        // remove $ symbol from key
        const newKey = key.replace(/\$/g, "");
        const splitKey = newKey.split(".");

        if (splitKey.length > 1 && !this.isSubQueryManually) {
          this.subQuery = false;
        }
      }
    }

    return { [Op.or]: result };
  }

  public orderBy(query) {
    const orderStrict = ["order_by", "direction"];
    const order = Object.fromEntries(
      Object.entries(query).filter(([key]) => orderStrict.includes(key)),
    );

    if (Object.keys(order).length > 0) {
      const field = order.order_by as string;
      return [[...field.split("-"), order.direction || "ASC"]];
    }

    return [];
  }

  protected buildEagerLoad(relations) {
    return relations.map((value) => {
      const relation = value.split(".");
      return this.buildAssociation(relation);
    });
  }

  protected buildAssociation(relation: Array<any>) {
    if (relation.length > 1) {
      const associationName = relation[0];
      relation.shift();
      const filterJoinOn = this.join.filter((value) => value.field === associationName);

      let isRequired = false;
      if (typeof this.query["get_" + associationName] !== "undefined") {
        isRequired = true;
        delete this.query["get_" + associationName];
      }

      return {
        required: isRequired,
        association: associationName,
        paranoid: false,
        include: [this.buildAssociation(relation)],
        ...filterJoinOn[0],
      };
    } else {
      let isRequired = false;
      if (typeof this.query["get_" + relation[0]] !== "undefined") {
        isRequired = true;
        delete this.query["get_" + relation[0]];
      }

      return {
        required: isRequired,
        association: relation[0],
        paranoid: false,
      };
    }
  }

  public joinOn(association: string, on: Array<any>) {
    const data = { on: {}, field: association };

    for (let index = 0; index < on.length; index++) {
      data.on["col" + index] = sequelize.where(on[index][0], on[index][1], on[index][2]);
    }

    this.join.push(data);
    return this;
  }

  public options(options) {
    this.extraOptions = options;
    return this;
  }

  protected remappingWhereCondition(condition) {
    for (const key in condition) {
      // remove $ symbol from key
      const newKey = key.replace(/\$/g, "");
      const splitKey = newKey.split(".");

      if (splitKey.length > 1 && splitKey[0] !== this.model.tableName) {
        this.deepRelation(condition[key], splitKey, this.relation);
        delete condition[key];
      }
    }

    return condition;
  }

  protected deepRelation(value, condition, relation = []) {
    const findRelations = relation.filter((value) => value.association === condition[0]);

    findRelations.forEach((findRelation) => {
      // > 2 because the first index is the association name and the second index is the field name
      if (condition.length > 2) {
        if (findRelation) {
          condition.shift();
          findRelation.required = true;
          this.deepRelation(value, condition, findRelation.include);
        }
      } else {
        findRelation.where = { ...findRelation.where, [condition[1]]: value };
        findRelation.required = true;
      }

      /**
       * set subquery to false
       * there is problem if subquery is true with
       * condition inside include/association
       * */
      if (!this.isSubQueryManually) {
        this.subQuery = false;
      }
    });
  }

  public setSubQuery(subQuery: boolean) {
    this.subQuery = subQuery;
    this.isSubQueryManually = true;
    return this;
  }

  public setRunCount(runCount: boolean) {
    this.runCount = runCount;
    return this;
  }
}
