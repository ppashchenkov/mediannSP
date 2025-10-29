class Device {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll(page = 1, limit = 10, search = '', deviceTypeId = null, status = null, location = null) {
    let query = this.knex('devices')
      .select('devices.*', 'device_types.name as device_type_name', 'users.username as created_by_username', 'users_updated.username as updated_by_username', 'contracts.contract_number')
      .leftJoin('device_types', 'devices.device_type_id', 'device_types.id')
      .leftJoin('users', 'devices.created_by', 'users.id')
      .leftJoin('users as users_updated', 'devices.updated_by', 'users_updated.id')
      .leftJoin('contracts', 'devices.contract_id', 'contracts.id');

    if (search) {
      query = query.where(function() {
        this.where('devices.name', 'ilike', `%${search}%`)
          .orWhere('devices.serial_number', 'ilike', `%${search}%`)
          .orWhere('devices.manufacturer', 'ilike', `%${search}%`)
          .orWhere('devices.model', 'ilike', `%${search}%`);
      });
    }

    if (deviceTypeId) {
      query = query.andWhere('devices.device_type_id', deviceTypeId);
    }

    if (status) {
      query = query.andWhere('devices.status', status);
    }

    if (location) {
      query = query.andWhere('devices.location', 'ilike', `%${location}%`);
    }

    const totalCount = await query.clone().count('* as count').first();
    const devices = await query
      .orderBy('devices.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      devices,
      totalCount: parseInt(totalCount.count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount.count / limit)
    };
  }

  async getById(id) {
    const device = await this.knex('devices')
      .select('devices.*', 'device_types.name as device_type_name',
              'users.username as created_by_username', 'users_updated.username as updated_by_username',
              'contracts.contract_number')
      .leftJoin('device_types', 'devices.device_type_id', 'device_types.id')
      .leftJoin('users', 'devices.created_by', 'users.id')
      .leftJoin('users as users_updated', 'devices.updated_by', 'users_updated.id')
      .leftJoin('contracts', 'devices.contract_id', 'contracts.id')
      .where({ 'devices.id': id })
      .first();

    // Get components for this device
    const components = await this.knex('device_components')
      .select('components.*', 'component_types.name as component_type_name')
      .leftJoin('components', 'device_components.component_id', 'components.id')
      .leftJoin('component_types', 'components.component_type_id', 'component_types.id')
      .where({ 'device_components.device_id': id, 'device_components.is_active': true });

    device.components = components;
    
    return device;
  }

  async create(deviceData) {
    // Проверяем, что contract_id присутствует при создании устройства
    if (!deviceData.contract_id) {
      throw new Error('Contract ID is required when creating a device');
    }
    
    const [id] = await this.knex('devices').insert(deviceData).returning('id');
    return this.getById(id);
  }

  async update(id, deviceData) {
    await this.knex('devices').where({ id }).update({
      ...deviceData,
      updated_at: this.knex.fn.now()
    });
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('devices').where({ id }).del();
  }

  async addComponent(deviceId, componentId, userId) {
    // Check if the component is already added to the device
    const existing = await this.knex('device_components')
      .where({ device_id: deviceId, component_id: componentId, is_active: true })
      .first();
    
    if (existing) {
      throw new Error('Component is already added to this device');
    }
    
    const [id] = await this.knex('device_components').insert({
      device_id: deviceId,
      component_id: componentId,
      installed_by: userId
    }).returning('id');
    
    return this.knex('device_components').where({ id }).first();
  }

  async removeComponent(deviceId, componentId) {
    return await this.knex('device_components')
      .where({ device_id: deviceId, component_id: componentId })
      .update({ is_active: false });
  }
}

module.exports = Device;