export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      article_blocks: {
        Row: {
          article_slug: string;
          content: string;
          kind: string;
          position: number;
        };
        Insert: {
          article_slug: string;
          content: string;
          kind?: string;
          position: number;
        };
        Update: {
          article_slug?: string;
          content?: string;
          kind?: string;
          position?: number;
        };
        Relationships: [];
      };
      article_bookmarks: {
        Row: {
          article_slug: string;
          created_at?: string;
          user_id: string;
        };
        Insert: {
          article_slug: string;
          user_id: string;
        };
        Update: {
          article_slug?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      article_likes: {
        Row: {
          article_slug: string;
          created_at?: string;
          user_id: string;
        };
        Insert: {
          article_slug: string;
          user_id: string;
        };
        Update: {
          article_slug?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      article_tags: {
        Row: {
          article_slug: string;
          tag_slug: string;
        };
        Insert: {
          article_slug: string;
          tag_slug: string;
        };
        Update: {
          article_slug?: string;
          tag_slug?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          article_slug: string;
          content: string;
          created_at?: string;
          id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: "pending" | "approved" | "rejected" | "hidden";
          updated_at?: string;
          user_id: string;
        };
        Insert: {
          article_slug: string;
          content: string;
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: "pending" | "approved" | "rejected" | "hidden";
          user_id: string;
        };
        Update: {
          article_slug?: string;
          content?: string;
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: "pending" | "approved" | "rejected" | "hidden";
          user_id?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          author_slug: string;
          category_slug: string;
          comments_count: number;
          cover_alt: string;
          created_at?: string;
          excerpt: string;
          legacy_id: string | null;
          likes_count: number;
          palette: string;
          published_at: string | null;
          reading_time: string;
          slug: string;
          status: "draft" | "published";
          title: string;
          updated_by: string | null;
          updated_at?: string;
        };
        Insert: {
          author_slug: string;
          category_slug: string;
          comments_count?: number;
          cover_alt: string;
          excerpt: string;
          legacy_id?: string | null;
          likes_count?: number;
          palette: string;
          published_at?: string | null;
          reading_time: string;
          slug: string;
          status?: "draft" | "published";
          title: string;
          updated_by?: string | null;
        };
        Update: {
          author_slug?: string;
          category_slug?: string;
          comments_count?: number;
          cover_alt?: string;
          excerpt?: string;
          legacy_id?: string | null;
          likes_count?: number;
          palette?: string;
          published_at?: string | null;
          reading_time?: string;
          slug?: string;
          status?: "draft" | "published";
          title?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      authors: {
        Row: {
          created_at?: string;
          name: string;
          slug: string;
        };
        Insert: {
          name: string;
          slug: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at?: string;
          description: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          description?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          description?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      homepage_modules: {
        Row: {
          article_slug: string | null;
          category_label: string;
          created_at?: string;
          excerpt: string;
          href: string;
          palette: string;
          slot_key: string;
          slot_type: "feature" | "side_feature" | "spotlight";
          sort_order: number;
          title: string;
          updated_at?: string;
        };
        Insert: {
          article_slug?: string | null;
          category_label: string;
          excerpt: string;
          href: string;
          palette: string;
          slot_key: string;
          slot_type: "feature" | "side_feature" | "spotlight";
          sort_order?: number;
          title: string;
        };
        Update: {
          article_slug?: string | null;
          category_label?: string;
          excerpt?: string;
          href?: string;
          palette?: string;
          slot_key?: string;
          slot_type?: "feature" | "side_feature" | "spotlight";
          sort_order?: number;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at?: string;
          display_name: string;
          email: string;
          id: string;
          is_admin: boolean;
          updated_at?: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          display_name?: string;
          email: string;
          id: string;
          is_admin?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          display_name?: string;
          email?: string;
          id?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at?: string;
          description: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          description?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          description?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      admin_article_engagement: {
        Row: {
          approved_comment_count: number | null;
          article_slug: string | null;
          bookmark_count: number | null;
          like_count: number | null;
          pending_comment_count: number | null;
          title: string | null;
        };
      };
      admin_user_overview: {
        Row: {
          bookmark_count: number | null;
          comment_count: number | null;
          created_at: string | null;
          display_name: string | null;
          email: string | null;
          id: string | null;
          is_admin: boolean | null;
          like_count: number | null;
        };
      };
      public_article_comments: {
        Row: {
          article_slug: string | null;
          author_name: string | null;
          content: string | null;
          created_at: string | null;
          id: string | null;
        };
      };
      public_article_engagement: {
        Row: {
          approved_comment_count: number | null;
          article_slug: string | null;
          bookmark_count: number | null;
          like_count: number | null;
        };
      };
    };
  };
};
