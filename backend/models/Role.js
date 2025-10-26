// Role model
class Role {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll() {
    return await this.knex('roles').select('*');
  }

  async getById(id) {
    return await this.knex('roles').where({ id }).first();
  }

  async create(roleData) {
    const [id] = await this.knex('roles').insert(roleData).returning('id');
    return this.getById(id);
  }

  async update(id, roleData) {
    await this.knex('roles').where({ id }).update(roleData);
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('roles').where({ id }).del();
  }

  async getByName(name) {
    return await this.knex('roles').where({ name }).first();
  }
}

module.exports = Role;