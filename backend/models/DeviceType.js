class DeviceType {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll() {
    return await this.knex('device_types').select('*');
  }

  async getById(id) {
    return await this.knex('device_types').where({ id }).first();
  }

  async getByName(name) {
    return await this.knex('device_types').where({ name }).first();
  }

  async create(deviceTypeData) {
    const [id] = await this.knex('device_types').insert(deviceTypeData).returning('id');
    return this.getById(id);
  }

  async update(id, deviceTypeData) {
    await this.knex('device_types').where({ id }).update(deviceTypeData);
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('device_types').where({ id }).del();
  }
}

module.exports = DeviceType;