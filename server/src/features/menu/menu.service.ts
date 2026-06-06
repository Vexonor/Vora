import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { S3Service } from '../../core/modules/s3/s3.service';

const S3_MENU_FOLDER = 'menus';

@Injectable()
export class MenuService {
  constructor(
    private response: ResponseHelper,
    @InjectModel(Menu)
    private readonly menuModel: typeof Menu,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createMenuDto: CreateMenuDto,
    file?: Express.Multer.File,
  ) {
    let imagePath: string | null = null;
    let imageUrl: string | null = null;

    if (file) {
      const uploadResult = await this.s3Service.uploadFile(
        file,
        S3_MENU_FOLDER,
      );
      imagePath = uploadResult.key;
      imageUrl = uploadResult.url;
    }

    try {
      const menu = await this.menuModel.create({
        ...createMenuDto,
        image_path: imagePath,
        image_url: imageUrl,
      });

      return this.response.success(menu, 201, 'Successfully created menu');
    } catch (error: any) {
      if (imagePath) {
        await this.s3Service.deleteFile(imagePath);
      }
      return this.response.fail(error.message, 400);
    }
  }

  async findAll(query: { q?: string; status?: string } = {}) {
    const where: any = {};

    if (query.q) {
      where.name = { [Op.like]: `%${query.q}%` };
    }

    if (query.status !== undefined && query.status !== '') {
      try {
        const parsed = JSON.parse(query.status);
        if (Array.isArray(parsed) && parsed.length > 0) {
          where.status = { [Op.in]: parsed.map(Number) };
        } else {
          where.status = Number(query.status);
        }
      } catch {
        where.status = Number(query.status);
      }
    }

    const menus = await this.menuModel.findAll({ where });
    return this.response.success(menus, 200, 'Successfully retrieved all menus');
  }

  async findOne(id: number) {
    const menu = await this.menuModel.findByPk(id);
    if (!menu) {
      return this.response.fail(`Menu with ID ${id} not found`, 404);
    }
    return this.response.success(menu, 200, 'Successfully retrieved menu');
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto,
    file?: Express.Multer.File,
  ) {
    const menu = await this.menuModel.findByPk(id);
    if (!menu) {
      return this.response.fail(`Menu with ID ${id} not found`, 404);
    }

    let imagePath = menu.image_path;
    let imageUrl = menu.image_url;

    if (file) {
      if (menu.image_path) {
        await this.s3Service.deleteFile(menu.image_path);
      }

      const uploadResult = await this.s3Service.uploadFile(
        file,
        S3_MENU_FOLDER,
      );
      imagePath = uploadResult.key;
      imageUrl = uploadResult.url;
    }

    try {
      await menu.update({
        ...updateMenuDto,
        image_path: imagePath,
        image_url: imageUrl,
      });

      return this.response.success(menu, 200, 'Successfully updated menu');
    } catch (error: any) {
      return this.response.fail(error.message, 400);
    }
  }

  async remove(id: number) {
    const menu = await this.menuModel.findByPk(id);
    if (!menu) {
      return this.response.fail(`Menu with ID ${id} not found`, 404);
    }

    try {
      if (menu.image_path) {
        await this.s3Service.deleteFile(menu.image_path);
      }

      await menu.destroy();

      return this.response.success({}, 200, `Menu with ID ${id} has been deleted`);
    } catch (error: any) {
      return this.response.fail(error.message, 400);
    }
  }
}
