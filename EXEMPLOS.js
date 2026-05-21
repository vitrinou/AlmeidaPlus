/**
 * EXEMPLOS DE USO - Supabase Client para AlmeidaPlus
 * Copie e cole essas funções no seu código
 */

// ============================================
// 1. AUTENTICAÇÃO
// ============================================

// Fazer login
async function fazerLogin(email, senha) {
  const user = await window.supabase.getUser(email);
  
  if (user && user.password === senha) {
    console.log('✅ Login bem-sucedido:', user.name);
    return user;
  } else {
    console.error('❌ Email ou senha incorretos');
    return null;
  }
}

// Testar:
// fazerLogin('allmeiids@gmail.com', 'Mudar@123')


// ============================================
// 2. GERENCIAR USUÁRIOS
// ============================================

// Criar novo usuário
async function criarUsuario(nome, email, senha) {
  const novoUser = {
    email: email.toLowerCase().trim(),
    name: nome,
    password: senha,
    role: 'user',
    active: true,
    platforms: [],
    avatar: null,
    isFirstLogin: true
  };
  
  const resultado = await window.supabase.createUser(novoUser);
  console.log('✅ Usuário criado:', resultado);
  return resultado;
}

// Testar:
// criarUsuario('João Silva', 'joao@example.com', 'senha123')


// Atualizar usuário
async function atualizarUsuario(userId, dados) {
  const resultado = await window.supabase.updateUser(userId, dados);
  console.log('✅ Usuário atualizado:', resultado);
  return resultado;
}

// Testar:
// atualizarUsuario('user-id-aqui', { name: 'Novo Nome' })


// ============================================
// 3. GERENCIAR PLATAFORMAS
// ============================================

// Obter todas as plataformas
async function obterPlataformas() {
  const plataformas = await window.supabase.getPlatforms();
  console.log('✅ Plataformas:', plataformas);
  return plataformas;
}

// Testar:
// obterPlataformas()


// Adicionar nova plataforma
async function adicionarPlataforma(id, nome, logo, url) {
  const novaPlatforma = {
    id,
    name: nome,
    logo,
    url,
    email: 'conta@streaming.com',
    password: 'senha123',
    total_slots: 4,
    occupied_slots: 1,
    enabled: true
  };
  
  const resultado = await window.supabase.addPlatform(novaPlatforma);
  console.log('✅ Plataforma adicionada:', resultado);
  return resultado;
}

// Testar:
// adicionarPlataforma('999', 'CrunchyRoll', 'https://...', 'https://crunchyroll.com')


// Atualizar plataforma
async function atualizarPlataforma(id, dados) {
  const resultado = await window.supabase.updatePlatform(id, dados);
  console.log('✅ Plataforma atualizada:', resultado);
  return resultado;
}

// Testar:
// atualizarPlataforma('8', { email: 'novo@email.com' })


// ============================================
// 4. GERENCIAR FAVORITOS
// ============================================

// Obter favoritos do usuário
async function obterFavoritos(userId) {
  const favoritos = await window.supabase.getUserFavorites(userId);
  console.log('✅ Favoritos:', favoritos);
  return favoritos;
}

// Testar:
// obterFavoritos('user-id-aqui')


// Adicionar filme aos favoritos
async function adicionarFavorito(userId, movieId, movieTitle) {
  const resultado = await window.supabase.addFavorite(userId, movieId, movieTitle);
  console.log('✅ Adicionado aos favoritos:', movieTitle);
  return resultado;
}

// Testar:
// adicionarFavorito('user-id', 101, 'Stranger Things')


// Remover dos favoritos
async function removerFavorito(userId, movieId) {
  await window.supabase.removeFavorite(userId, movieId);
  console.log('✅ Removido dos favoritos');
}

// Testar:
// removerFavorito('user-id', 101)


// ============================================
// 5. GERENCIAR CONFIGURAÇÕES
// ============================================

// Obter configurações do usuário
async function obterConfigurações(userId) {
  const config = await window.supabase.getUserSettings(userId);
  console.log('✅ Configurações:', config);
  return config;
}

// Testar:
// obterConfigurações('user-id-aqui')


// Atualizar configurações
async function atualizarConfigurações(userId, config) {
  await window.supabase.updateSettings(userId, config);
  console.log('✅ Configurações salvas:', config);
}

// Testar:
// atualizarConfigurações('user-id', { 
//   sidebar_collapsed: true,
//   theme: 'dark'
// })


// ============================================
// 6. OPERAÇÕES EM LOTE
// ============================================

// Obter todos os usuários
async function obterTodosUsers() {
  const users = await window.supabase.getAllUsers();
  console.log('✅ Total de usuários:', users.length);
  return users;
}

// Testar:
// obterTodosUsers()


// Operação complexa: Copiar plataformas de um usuário para outro
async function copiarAcessos(userSourceId, userTargetId) {
  const users = await window.supabase.getAllUsers();
  
  const source = users.find(u => u.id === userSourceId);
  const target = users.find(u => u.id === userTargetId);
  
  if (source && target) {
    await window.supabase.updateUser(userTargetId, {
      platforms: source.platforms
    });
    console.log('✅ Acessos copiados:', source.platforms);
  }
}

// Testar:
// copiarAcessos('user-source', 'user-target')


// ============================================
// 7. CACHE E PERFORMANCE
// ============================================

// Limpar todo o cache
function limparCache() {
  window.supabase.clearCache();
  console.log('✅ Cache limpo');
}

// Testar:
// limparCache()


// Obter informações do cache
function infoCache() {
  console.log('📊 Cache atual:', window.supabase.cache);
  console.log('📊 Tamanho cache:', window.supabase.cache.size);
}

// Testar:
// infoCache()


// ============================================
// 8. TRATAMENTO DE ERROS
// ============================================

// Função com tratamento completo de erros
async function operacaoSegura(funcao, nomeOperacao) {
  try {
    console.log(`⏳ Iniciando: ${nomeOperacao}...`);
    const resultado = await funcao();
    console.log(`✅ Sucesso: ${nomeOperacao}`);
    return resultado;
  } catch (erro) {
    console.error(`❌ Erro em ${nomeOperacao}:`, erro.message);
    
    // Fallback para localStorage
    const cached = localStorage.getItem(nomeOperacao);
    if (cached) {
      console.log(`⚠️ Usando cache local como fallback`);
      return JSON.parse(cached);
    }
    
    return null;
  }
}

// Testar:
// operacaoSegura(() => obterPlataformas(), 'carregar-plataformas')


// ============================================
// 9. TESTES COMPLETOS
// ============================================

async function testeCompleto() {
  console.log('🧪 Iniciando teste completo...\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Testando login...');
    const user = await fazerLogin('allmeiids@gmail.com', 'Mudar@123');
    if (!user) throw new Error('Login falhou');
    
    // 2. Obter plataformas
    console.log('2️⃣ Obtendo plataformas...');
    const plataformas = await obterPlataformas();
    console.log(`   → ${plataformas.length} plataformas encontradas`);
    
    // 3. Obter todos os usuários
    console.log('3️⃣ Obtendo usuários...');
    const users = await obterTodosUsers();
    console.log(`   → ${users.length} usuários encontrados`);
    
    // 4. Status do cache
    console.log('4️⃣ Status do cache:');
    infoCache();
    
    console.log('\n✅ Teste completo realizado com sucesso!');
    
  } catch (erro) {
    console.error('❌ Teste falhou:', erro.message);
  }
}

// Rodar teste:
// testeCompleto()


// ============================================
// 10. ATALHOS ÚTEIS
// ============================================

// Adicionar ao console global para usar direto:
window.sup = {
  // Usuários
  users: () => obterTodosUsers(),
  login: (e, s) => fazerLogin(e, s),
  criarUser: (n, e, s) => criarUsuario(n, e, s),
  
  // Plataformas
  plataformas: () => obterPlataformas(),
  
  // Cache
  cache: () => infoCache(),
  limpar: () => limparCache(),
  
  // Teste
  teste: () => testeCompleto()
};

// Agora você pode chamar no console:
// sup.teste()        → Roda teste completo
// sup.users()        → Lista usuários
// sup.plataformas()  → Lista plataformas
// sup.cache()        → Mostra cache
// sup.limpar()       → Limpa cache
