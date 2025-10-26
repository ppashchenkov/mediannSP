const bcrypt = require('bcryptjs');

class User {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll(page = 1, limit = 10, search = '') {
    let query = this.knex('users')
      .select('users.*', 'roles.name as role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id');

    if (search) {
      query = query.where(function() {
        this.where('users.username', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`);
      });
    }

    const totalCount = await query.clone().count('* as count').first();
    const users = await query
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      users,
      totalCount: parseInt(totalCount.count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount.count / limit)
    };
  }

  async getById(id) {
    return await this.knex('users')
      .select('users.*', 'roles.name as role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where({ 'users.id': id })
      .first();
  }

  async getByUsername(username) {
    return await this.knex('users')
      .select('users.*', 'roles.name as role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where({ 'users.username': username })
      .first();
  }

  async getByEmail(email) {
    return await this.knex('users')
      .select('users.*', 'roles.name as role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where({ 'users.email': email })
      .first();
  }

  async create(userData) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [id] = await this.knex('users').insert({
      ...userData,
      password_hash: hashedPassword
    }).returning('id');
    
    return this.getById(id);
  }

  async update(id, userData) {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password_hash = await bcrypt.hash(userData.password, 10);
      delete userData.password; // Remove plaintext password
    }
    
    await this.knex('users').where({ id }).update({
      ...userData,
      updated_at: this.knex.fn.now()
    });
    
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('users').where({ id }).del();
  }

  async comparePassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = User;