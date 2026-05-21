-- SUPABASE SQL SCHEMA PARA ALMEIDA+
-- Execute isso no SQL Editor do Supabase

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar TEXT,
  active BOOLEAN DEFAULT true,
  is_first_login BOOLEAN DEFAULT true,
  platforms JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA DE PLATAFORMAS (STREAMINGS)
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  color TEXT,
  hover_color TEXT,
  url TEXT,
  email TEXT,
  password TEXT,
  total_slots INTEGER DEFAULT 4,
  occupied_slots INTEGER DEFAULT 1,
  price DECIMAL(10, 2) DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABELA DE FAVORITOS DO USUÁRIO
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- 4. TABELA DE CONFIGURAÇÕES DE USUÁRIO
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sidebar_collapsed BOOLEAN DEFAULT false,
  preferred_platform TEXT,
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 6. INSERT DEFAULT ADMIN USER
INSERT INTO users (email, name, password, role, active, is_first_login, platforms)
VALUES (
  'allmeiids@gmail.com',
  'Almeida (Admin)',
  'Mudar@123',
  'admin',
  true,
  false,
  '["8", "119", "337", "307", "1899", "531", "350"]'
) ON CONFLICT DO NOTHING;

-- 7. INSERT DEFAULT PLATFORMS
INSERT INTO platforms (id, name, logo, url, email, password, price, enabled)
VALUES
  ('8', 'Netflix', 'https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiBUpj376qRS.png', 'https://netflix.com', 'netflix.almeida@gmail.com', 'AlmeidaSenha123', 18.00, true),
  ('119', 'Amazon Prime Video', 'https://image.tmdb.org/t/p/original/ceF6rD1uiL9V7rvWxugpa16t6HJ.png', 'https://primevideo.com', 'amazon.almeida@gmail.com', 'AlmeidaSenha123', 10.00, true),
  ('337', 'Disney+', 'https://image.tmdb.org/t/p/original/97eaog45n2oa7LV6Xg582G541XH.png', 'https://disneyplus.com', 'disney.almeida@gmail.com', 'AlmeidaSenha123', 15.00, true),
  ('307', 'Globoplay', 'https://image.tmdb.org/t/p/original/vMj2Q30VxvNt0VAIQzb8ZQHWwNZ.png', 'https://globoplay.globo.com', 'globoplay.almeida@gmail.com', 'AlmeidaSenha123', 12.00, true),
  ('1899', 'HBO Max', 'https://image.tmdb.org/t/p/original/fksCUZ9QDWZMUwL2LgMtLckROUN.jpg', 'https://max.com', 'hbo.almeida@gmail.com', 'AlmeidaSenha123', 16.00, true),
  ('531', 'Paramount+', 'https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg', 'https://paramountplus.com', 'paramount.almeida@gmail.com', 'AlmeidaSenha123', 9.00, true),
  ('350', 'Apple TV+', 'https://image.tmdb.org/t/p/original/9ghgSC0MA082EL6HLCW3GalykFD.jpg', 'https://tv.apple.com', 'apple.almeida@gmail.com', 'AlmeidaSenha123', 11.00, true)
ON CONFLICT DO NOTHING;

-- FEITO! Agora você pode usar o Supabase para sincronizar dados.
