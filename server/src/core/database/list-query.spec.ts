import { Op } from 'sequelize';
import {
  MAX_PAGE_SIZE,
  toNumberList,
  toPagination,
  toSearchCondition,
  toSortOrder,
} from './list-query';

describe('toPagination', () => {
  it('mengembalikan semua data ketika page dan limit tidak dikirim', () => {
    expect(toPagination({})).toEqual({});
  });

  it('menghitung offset dari page dan limit', () => {
    expect(toPagination({ page: '3', limit: '10' })).toEqual({
      limit: 10,
      offset: 20,
    });
  });

  it('memakai default untuk nilai yang tidak valid', () => {
    expect(toPagination({ page: 'abc', limit: '-5' })).toEqual({
      limit: 20,
      offset: 0,
    });
  });

  it('membatasi limit maksimal', () => {
    expect(toPagination({ limit: '100000' }).limit).toBe(MAX_PAGE_SIZE);
  });
});

describe('toSortOrder', () => {
  const sortable = ['created_at', 'name'];

  it('mengurutkan field yang diizinkan', () => {
    expect(
      toSortOrder({ order_by: 'created_at', direction: 'desc' }, sortable),
    ).toEqual([['created_at', 'DESC']]);
  });

  it('memakai ASC untuk arah yang tidak dikenal', () => {
    expect(
      toSortOrder({ order_by: 'name', direction: 'sideways' }, sortable),
    ).toEqual([['name', 'ASC']]);
  });

  it('mengabaikan nilai yang bukan string', () => {
    expect(
      toSortOrder({ order_by: ['name'], direction: { a: '1' } }, sortable),
    ).toEqual([]);
    expect(
      toSortOrder({ order_by: 'name', direction: ['DESC'] }, sortable),
    ).toEqual([['name', 'ASC']]);
  });

  it('mengabaikan field yang tidak diizinkan', () => {
    expect(toSortOrder({ order_by: 'password' }, sortable)).toEqual([]);
  });
});

describe('toSearchCondition', () => {
  it('tidak memfilter ketika kata kunci kosong', () => {
    expect(toSearchCondition('   ', ['name'])).toEqual({});
  });

  it('tidak memfilter ketika kata kunci bukan string', () => {
    expect(toSearchCondition(['a', 'b'], ['name'])).toEqual({});
    expect(toSearchCondition({ $gt: 'a' }, ['name'])).toEqual({});
  });

  it('mencari kata kunci di semua field', () => {
    expect(toSearchCondition(' kg ', ['name', 'abbreviation'])).toEqual({
      [Op.or]: [
        { name: { [Op.like]: '%kg%' } },
        { abbreviation: { [Op.like]: '%kg%' } },
      ],
    });
  });
});

describe('toNumberList', () => {
  it('membaca array JSON', () => {
    expect(toNumberList('[1,2]')).toEqual([1, 2]);
  });

  it('membaca satu angka', () => {
    expect(toNumberList('3')).toEqual([3]);
  });

  it('mengabaikan nilai kosong atau bukan angka', () => {
    expect(toNumberList(undefined)).toBeUndefined();
    expect(toNumberList('')).toBeUndefined();
    expect(toNumberList('abc')).toBeUndefined();
  });
});
