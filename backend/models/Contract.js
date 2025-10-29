class Contract {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll(page = 1, limit = 10, search = '') {
    let query = this.knex('contracts')
      .select('contracts.*', 'users.username as user_name')
      .leftJoin('users', 'contracts.user_id', 'users.id');

    if (search) {
      query = query.where(function() {
        this.where('contracts.contract_number', 'ilike', `%${search}%`)
          .orWhere('contracts.contract_date', 'ilike', `%${search}%`)
          .orWhere('users.username', 'ilike', `%${search}%`);
      });
    }

    const totalCount = await query.clone().count('* as count').first();
    const contracts = await query
      .orderBy('contracts.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      contracts,
      totalCount: parseInt(totalCount.count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount.count / limit)
    };
  }

  async getById(id) {
    return await this.knex('contracts')
      .select('contracts.*', 'users.username as user_name')
      .leftJoin('users', 'contracts.user_id', 'users.id')
      .where({ 'contracts.id': id })
      .first();
  }

  async create(contractData) {
    const [id] = await this.knex('contracts').insert(contractData).returning('id');
    return this.getById(id);
  }

  async update(id, contractData) {
    await this.knex('contracts').where({ id }).update({
      ...contractData,
      updated_at: this.knex.fn.now()
    });
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('contracts').where({ id }).del();
  }
}

module.exports = Contract;