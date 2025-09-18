export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          created_at?: string;
          updated_at?: string;
          type: string;
          url: string;
          verified: boolean;
          verification_status: 'pending' | 'approved' | 'rejected';
          verified_at?: string;
          verified_by?: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type: string;
          url: string;
          verified?: boolean;
          verification_status?: 'pending' | 'approved' | 'rejected';
          verified_at?: string;
          verified_by?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type?: string;
          url?: string;
          verified?: boolean;
          verification_status?: 'pending' | 'approved' | 'rejected';
          verified_at?: string;
          verified_by?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string;
          role: 'user' | 'huissier' | 'admin';
          updated_at?: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string;
          role?: 'user' | 'huissier' | 'admin';
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string;
          role?: 'user' | 'huissier' | 'admin';
          updated_at?: string;
        };
      };
    };
  };
};
