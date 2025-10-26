class Photo {
  constructor(knex) {
    this.knex = knex;
  }

  async getAllByEntity(entityType, entityId) {
    return await this.knex('photos')
      .select('*')
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('is_primary', 'desc') // Primary photo first
      .orderBy('uploaded_at', 'asc');
  }

  async getById(id) {
    return await this.knex('photos').where({ id }).first();
  }

  async create(photoData) {
    const [id] = await this.knex('photos').insert(photoData).returning('id');
    return this.getById(id);
  }

  async update(id, photoData) {
    await this.knex('photos').where({ id }).update(photoData);
    return this.getById(id);
  }

  async delete(id) {
    return await this.knex('photos').where({ id }).del();
  }

  async setAsPrimary(photoId, entityType, entityId) {
    // First, set all photos for this entity as non-primary
    await this.knex('photos')
      .where({ entity_type: entityType, entity_id: entityId })
      .update({ is_primary: false });
    
    // Then set the specified photo as primary
    await this.knex('photos')
      .where({ id: photoId })
      .update({ is_primary: true });
    
    return this.getById(photoId);
  }
  
  async getPrimaryPhoto(entityType, entityId) {
    return await this.knex('photos')
      .where({ entity_type: entityType, entity_id: entityId, is_primary: true })
      .first();
  }
}

module.exports = Photo;