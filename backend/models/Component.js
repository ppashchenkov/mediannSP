class Component {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll(page = 1, limit = 10, search = '', componentTypeId = null, status = null) {
    let query = this.knex('components')
      .select('components.*', 'component_types.name as component_type_name', 'users.username as created_by_username')
      .leftJoin('component_types', 'components.component_type_id', 'component_types.id')
      .leftJoin('users', 'components.created_by', 'users.id');

    if (search) {
      query = query.where(function() {
        this.where('components.name', 'ilike', `%${search}%`)
          .orWhere('components.serial_number', 'ilike', `%${search}%`)
          .orWhere('components.manufacturer', 'ilike', `%${search}%`)
          .orWhere('components.model', 'ilike', `%${search}%`);
      });
    }

    if (componentTypeId) {
      query = query.andWhere('components.component_type_id', componentTypeId);
    }

    if (status) {
      query = query.andWhere('components.status', status);
    }

    const totalCount = await query.clone().count('* as count').first();
    const components = await query
      .orderBy('components.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      components,
      totalCount: parseInt(totalCount.count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount.count / limit)
    };
  }

  async getById(id) {
    return await this.knex('components')
      .select('components.*', 'component_types.name as component_type_name', 
              'users.username as created_by_username', 'users_updated.username as updated_by_username')
      .leftJoin('component_types', 'components.component_type_id', 'component_types.id')
      .leftJoin('users', 'components.created_by', 'users.id')
      .leftJoin('users as users_updated', 'components.updated_by', 'users_updated.id')
      .where({ 'components.id': id })
      .first();
  }

  async create(componentData) {
    const [id] = await this.knex('components').insert(componentData).returning('id');
    return this.getById(id);
  }

  async update(id, componentData) {
    await this.knex('components').where({ id }).update({
      ...componentData,
      updated_at: this.knex.fn.now()
    });
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('components').where({ id }).del();
  }
}

module.exports = Component;