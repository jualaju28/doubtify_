import { query } from '../db/connection.js';

export class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.email = userData.email;
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.role = userData.role;
    this.bio = userData.bio;
    this.avatarUrl = userData.avatar_url;
    this.emailVerified = userData.email_verified;
    this.isActive = userData.is_active;
    this.lastLogin = userData.last_login;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, passwordHash, firstName, lastName, bio } = userData;
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, bio)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [username, email, passwordHash, firstName, lastName, bio]
    );

    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by username
  static async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Update user profile
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
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
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    const updatedUser = new User(result.rows[0]);
    Object.assign(this, updatedUser);
    return this;
  }

  // Update last login
  async updateLastLogin() {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );
    this.lastLogin = new Date();
  }

  // Get user with reputation
  static async findWithReputation(id) {
    const result = await query(
      `SELECT u.*, ur.total_reputation, ur.doubts_asked, ur.responses_given, 
              ur.responses_accepted, ur.upvotes_received, ur.downvotes_received,
              ur.streak_days, ur.last_activity_date
       FROM users u
       LEFT JOIN user_reputation ur ON u.id = ur.user_id
       WHERE u.id = $1 AND u.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];
    const user = new User(userData);
    user.reputation = {
      total: userData.total_reputation || 0,
      doubtsAsked: userData.doubts_asked || 0,
      responsesGiven: userData.responses_given || 0,
      responsesAccepted: userData.responses_accepted || 0,
      upvotesReceived: userData.upvotes_received || 0,
      downvotesReceived: userData.downvotes_received || 0,
      streakDays: userData.streak_days || 0,
      lastActivityDate: userData.last_activity_date
    };

    return user;
  }

  // Get leaderboard
  static async getLeaderboard(limit = 10) {
    const result = await query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url,
              ur.total_reputation, ur.responses_accepted, ur.upvotes_received
       FROM users u
       JOIN user_reputation ur ON u.id = ur.user_id
       WHERE u.is_active = true
       ORDER BY ur.total_reputation DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
      totalReputation: row.total_reputation,
      responsesAccepted: row.responses_accepted,
      upvotesReceived: row.upvotes_received
    }));
  }

  // Deactivate user
  async deactivate() {
    await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );
    this.isActive = false;
  }

  // Convert to safe object (without password)
  toSafeObject() {
    const { passwordHash, ...safeUser } = this;
    return safeUser;
  }
}

export default User;