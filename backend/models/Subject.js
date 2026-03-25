import { query } from '../db/connection.js';

export class Subject {
  constructor(subjectData) {
    this.id = subjectData.id;
    this.name = subjectData.name;
    this.description = subjectData.description;
    this.colorCode = subjectData.color_code;
    this.icon = subjectData.icon;
    this.isActive = subjectData.is_active;
    this.createdAt = subjectData.created_at;
    this.updatedAt = subjectData.updated_at;
    
    // Additional fields that might be joined
    this.doubtsCount = subjectData.doubts_count;
  }

  // Get all active subjects
  static async findAll() {
    const result = await query(
      `SELECT s.*, 
              COUNT(d.id) as doubts_count
       FROM subjects s
       LEFT JOIN doubts d ON s.id = d.subject_id AND d.status != 'closed'
       WHERE s.is_active = true
       GROUP BY s.id
       ORDER BY s.name ASC`
    );

    return result.rows.map(row => new Subject(row));
  }

  // Find subject by ID
  static async findById(id) {
    const result = await query(
      `SELECT s.*, 
              COUNT(d.id) as doubts_count
       FROM subjects s
       LEFT JOIN doubts d ON s.id = d.subject_id AND d.status != 'closed'
       WHERE s.id = $1 AND s.is_active = true
       GROUP BY s.id`,
      [id]
    );

    return result.rows.length > 0 ? new Subject(result.rows[0]) : null;
  }

  // Create a new subject
  static async create(subjectData) {
    const { name, description, colorCode, icon } = subjectData;
    
    const result = await query(
      `INSERT INTO subjects (name, description, color_code, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, colorCode, icon]
    );

    return new Subject(result.rows[0]);
  }

  // Update subject
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'color_code', 'icon', 'is_active'];
    
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
      `UPDATE subjects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    const updatedSubject = new Subject(result.rows[0]);
    Object.assign(this, updatedSubject);
    return this;
  }
}

export default Subject;