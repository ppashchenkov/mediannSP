class ComponentType {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll() {
    return await this.knex('component_types').select('*');
  }

  async getById(id) {
    return await this.knex('component_types').where({ id }).first();
  }

  async getByName(name) {
    return await this.knex('component_types').where({ name }).first();
  }

  async create(componentTypeData) {
    const [id] = await this.knex('component_types').insert(componentTypeData).returning('id');
    return this.getById(id);
  }

  async update(id, componentTypeData) {
    await this.knex('component_types').where({ id }).update(componentTypeData);
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('component_types').where({ id }).del();
  }
}

module.exports = ComponentType;