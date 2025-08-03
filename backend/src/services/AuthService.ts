import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User, IUser } from '../models/User';

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
}

export interface DiscordTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class AuthService {
  // Generate JWT for our app
  static generateToken(discordId: string): string {
    return jwt.sign({ discordId }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
  }

  // Verify JWT
  static verifyToken(token: string): { discordId: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as { discordId: string };
  }

  // Exchange Discord code for tokens
  static async exchangeCodeForTokens(code: string): Promise<DiscordTokens> {
    const response = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.FRONTEND_URL}/login`,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  }
  // Get Discord user info
  static async getDiscordUser(accessToken: string): Promise<DiscordUser> {
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  // Get user's Discord servers
  static async getUserGuilds(accessToken: string): Promise<any[]> {
    const response = await axios.get(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }

  // Save or update user in database
  static async saveUser(
    discordUser: DiscordUser,
    tokens: DiscordTokens
  ): Promise<IUser> {
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    const user = await User.findOneAndUpdate(
      { discordId: discordUser.id },
      {
        username: discordUser.username,
        avatar: discordUser.avatar,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
        lastLogin: new Date(),
      },
      { upsert: true, new: true }
    );

    return user;
  }

  // Refresh Discord access token
  static async refreshDiscordToken(
    refreshToken: string
  ): Promise<DiscordTokens> {
    const response = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  // Check if user has admin permissions in a server
  static hasAdminPermissions(guild: any): boolean {
    const permissions = BigInt(guild.permissions);
    const ADMINISTRATOR = BigInt(0x8);
    const MANAGE_GUILD = BigInt(0x20);

    return (
      (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
      (permissions & MANAGE_GUILD) === MANAGE_GUILD ||
      guild.owner === true
    );
  }
}
