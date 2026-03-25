import { query } from '../db/connection.js';

export class Doubt {
  constructor(doubtData) {
    this.id = doubtData.id;
    this.title = doubtData.title;
    this.description = doubtData.description;
    this.authorId = doubtData.author_id;
    this.subjectId = doubtData.subject_id;
    this.status = doubtData.status;
    this.acceptedResponseId = doubtData.accepted_response_id;
    this.viewsCount = doubtData.views_count;
    this.isFeatured = doubtData.is_featured;
    this.tags = doubtData.tags;
    this.createdAt = doubtData.created_at;
    this.updatedAt = doubtData.updated_at;
    
    // Additional fields that might be joined
    this.authorUsername = doubtData.author_username;
    this.authorName = doubtData.author_name;
    this.subjectName = doubtData.subject_name;
    this.responsesCount = doubtData.responses_count;
    this.upvotesCount = doubtData.upvotes_count;
    this.downvotesCount = doubtData.downvotes_count;
  }

  // Create a new doubt
  static async create(doubtData) {
    const { title, description, authorId, subjectId, tags } = doubtData;
    
    const result = await query(
      `INSERT INTO doubts (title, description, author_id, subject_id, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, authorId, subjectId, tags || []]
    );

    return new Doubt(result.rows[0]);
  }

  // Find doubt by ID with author and subject info
  static async findById(id, userId = null) {
    let sqlQuery = `
      SELECT d.*, 
             u.username as author_username,
             (u.first_name || ' ' || u.last_name) as author_name,
             s.name as subject_name,
             s.color_code as subject_color,
             (SELECT COUNT(*) FROM responses WHERE doubt_id = d.id) as responses_count,
             (SELECT COUNT(*) FROM ratings WHERE doubt_id = d.id AND rating_type = 'upvote') as upvotes_count,
             (SELECT COUNT(*) FROM ratings WHERE doubt_id = d.id AND rating_type = 'downvote') as downvotes_count
    `;

    if (userId) {
      sqlQuery += `,
             (SELECT rating_type FROM ratings WHERE doubt_id = d.id AND user_id = $2) as user_rating
      `;
    }

    sqlQuery += `
      FROM doubts d
      JOIN users u ON d.author_id = u.id
      JOIN subjects s ON d.subject_id = s.id
      WHERE d.id = $1
    `;

    const params = userId ? [id, userId] : [id];
    const result = await query(sqlQuery, params);

    if (result.rows.length === 0) {
      return null;
    }

    const doubtData = result.rows[0];
    const doubt = new Doubt(doubtData);
    
    if (userId) {
      doubt.userRating = doubtData.user_rating;
    }

    return doubt;
  }

  // Get all doubts with filters and pagination
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      status = null,
      subjectId = null,
      authorId = null,
      search = null,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      userId = null
    } = options;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (status) {
      conditions.push(`d.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (subjectId) {
      conditions.push(`d.subject_id = $${paramCount}`);
      params.push(subjectId);
      paramCount++;
    }

    if (authorId) {
      conditions.push(`d.author_id = $${paramCount}`);
      params.push(authorId);
      paramCount++;
    }

    if (search) {
      conditions.push(`(d.search_vector @@ plainto_tsquery('english', $${paramCount}) OR d.title ILIKE $${paramCount + 1})`);
      params.push(search, `%${search}%`);
      paramCount += 2;
    }

    let sqlQuery = `
      SELECT d.*, 
             u.username as author_username,
             (u.first_name || ' ' || u.last_name) as author_name,
             s.name as subject_name,
             s.color_code as subject_color,
             (SELECT COUNT(*) FROM responses WHERE doubt_id = d.id) as responses_count,
             (SELECT COUNT(*) FROM ratings WHERE doubt_id = d.id AND rating_type = 'upvote') as upvotes_count,
             (SELECT COUNT(*) FROM ratings WHERE doubt_id = d.id AND rating_type = 'downvote') as downvotes_count
    `;

    if (userId) {
      sqlQuery += `,
             (SELECT rating_type FROM ratings WHERE doubt_id = d.id AND user_id = $${paramCount}) as user_rating
      `;
      params.push(userId);
      paramCount++;
    }

    sqlQuery += `
      FROM doubts d
      JOIN users u ON d.author_id = u.id
      JOIN subjects s ON d.subject_id = s.id
    `;

    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add sorting
    const validSortColumns = ['created_at', 'updated_at', 'views_count', 'title'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    sqlQuery += ` ORDER BY d.${finalSortBy} ${finalSortOrder}`;

    // Add pagination
    sqlQuery += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sqlQuery, params);

    return result.rows.map(row => {
      const doubt = new Doubt(row);
      if (userId) {
        doubt.userRating = row.user_rating;
      }
      return doubt;
    });
  }

  // Get total count for pagination
  static async count(options = {}) {
    const {
      status = null,
      subjectId = null,
      authorId = null,
      search = null
    } = options;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (subjectId) {
      conditions.push(`subject_id = $${paramCount}`);
      params.push(subjectId);
      paramCount++;
    }

    if (authorId) {
      conditions.push(`author_id = $${paramCount}`);
      params.push(authorId);
      paramCount++;
    }

    if (search) {
      conditions.push(`(search_vector @@ plainto_tsquery('english', $${paramCount}) OR title ILIKE $${paramCount + 1})`);
      params.push(search, `%${search}%`);
      paramCount += 2;
    }

    let sqlQuery = 'SELECT COUNT(*) as count FROM doubts';
    
    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await query(sqlQuery, params);
    return parseInt(result.rows[0].count);
  }

  // Update doubt
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['title', 'description', 'status', 'tags', 'subject_id'];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this;
    }

    values.push(this.id);
    const result = await query(
      `UPDATE doubts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    const updatedDoubt = new Doubt(result.rows[0]);
    Object.assign(this, updatedDoubt);
    return this;
  }

  // Increment view count
  async incrementViews() {
    await query(
      'UPDATE doubts SET views_count = views_count + 1 WHERE id = $1',
      [this.id]
    );
    this.viewsCount++;
  }

  // Accept a response
  async acceptResponse(responseId) {
    const result = await query(
      `UPDATE doubts 
       SET accepted_response_id = $1, status = 'resolved', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [responseId, this.id]
    );

    // Update the response as accepted
    await query(
      'UPDATE responses SET is_accepted = true WHERE id = $1',
      [responseId]
    );

    Object.assign(this, new Doubt(result.rows[0]));
    return this;
  }

  // Delete doubt (soft delete by changing status)
  async delete() {
    await query(
      `UPDATE doubts 
       SET status = 'closed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [this.id]
    );
    this.status = 'closed';
  }

  // Get trending doubts
  static async getTrending(limit = 10) {
    const result = await query(
      `SELECT d.*, 
              u.username as author_username,
              (u.first_name || ' ' || u.last_name) as author_name,
              s.name as subject_name,
              (SELECT COUNT(*) FROM responses WHERE doubt_id = d.id) as responses_count,
              (SELECT COUNT(*) FROM ratings WHERE doubt_id = d.id AND rating_type = 'upvote') as upvotes_count
       FROM doubts d
       JOIN users u ON d.author_id = u.id
       JOIN subjects s ON d.subject_id = s.id
       WHERE d.created_at > NOW() - INTERVAL '7 days'
       ORDER BY (d.views_count + (SELECT COUNT(*) FROM ratings WHERE doubt_id = d.id)) DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => new Doubt(row));
  }

  // Get featured doubts
  static async getFeatured(limit = 5) {
    const result = await query(
      `SELECT d.*, 
              u.username as author_username,
              (u.first_name || ' ' || u.last_name) as author_name,
              s.name as subject_name
       FROM doubts d
       JOIN users u ON d.author_id = u.id
       JOIN subjects s ON d.subject_id = s.id
       WHERE d.is_featured = true AND d.status != 'closed'
       ORDER BY d.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => new Doubt(row));
  }
}

export default Doubt;