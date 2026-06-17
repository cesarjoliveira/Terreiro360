import { deleteApp, initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  projectId: "terreiro360",
  appId: "1:825865523691:web:6affeb622bc17bea66c9ae",
  storageBucket: "terreiro360.firebasestorage.app",
  apiKey: "AIzaSyBFRv1ZcZi6C-pgJSnh7cHXfFARW-f5CdQ",
  authDomain: "terreiro360.firebaseapp.com",
  messagingSenderId: "825865523691",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const today = new Date().toISOString().slice(0, 10);
const appRoot = document.querySelector("#app");

const state = {
  authReady: false,
  user: null,
  profile: null,
  view: "dashboard",
  selectedChildId: "",
  notice: "",
  children: [],
  dues: [],
  payables: [],
  receivables: [],
  products: [],
  sales: [],
  users: [],
  unsubscribers: [],
};

const navItems = {
  admin: [
    ["dashboard", "Painel", "bar-chart-3"],
    ["children", "Filhos", "users"],
    ["dues", "Mensalidades", "calendar-check"],
    ["payables", "A pagar", "receipt"],
    ["receivables", "A receber", "wallet"],
    ["sales", "Vendas", "shopping-bag"],
    ["products", "Produtos", "package"],
    ["users", "Usuários", "shield"],
  ],
  basic: [
    ["dashboard", "Painel", "bar-chart-3"],
    ["children", "Meu cadastro", "users"],
    ["dues", "Mensalidades", "calendar-check"],
    ["products", "Produtos", "package"],
  ],
};

const iconPaths = {
  "bar-chart-3": "M3 3v18h18M8 17V9m5 8V5m5 12v-6",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  "calendar-check": "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m4 10 2 2 4-4",
  receipt: "M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .67V2l-3 2-3-2-3 2-3-2-3 2Zm4 7h8m-8 4h8",
  wallet: "M19 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V6m15 7h.01",
  "shopping-bag": "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0",
  package: "m7.5 4.27 9 5.15M3.29 7 12 12l8.71-5M12 22V12M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4",
  plus: "M12 5v14m-7-7h14",
  trash: "M3 6h18M8 6V4h8v2m-1 0v14H9V6",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8",
  logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
};

onAuthStateChanged(auth, async (user) => {
  clearSubscriptions();
  state.user = user;
  state.profile = null;
  state.authReady = true;
  state.notice = "";

  if (!user) {
    render();
    return;
  }

  const profileSnap = await getDoc(doc(db, "users", user.uid));
  if (!profileSnap.exists()) {
    state.profile = null;
    render();
    return;
  }

  state.profile = { id: profileSnap.id, ...profileSnap.data() };
  state.view = "dashboard";
  subscribeData();
  render();
});

function clearSubscriptions() {
  state.unsubscribers.forEach((unsubscribe) => unsubscribe());
  state.unsubscribers = [];
}

function subscribeData() {
  const role = state.profile?.role;
  if (role === "admin") {
    subscribeCollection("children", query(collection(db, "children"), orderBy("name")));
    subscribeCollection("dues", query(collection(db, "dues"), orderBy("month", "desc")));
    subscribeCollection("payables", query(collection(db, "payables"), orderBy("dueDate")));
    subscribeCollection("receivables", query(collection(db, "receivables"), orderBy("dueDate")));
    subscribeCollection("products", query(collection(db, "products"), orderBy("name")));
    subscribeCollection("sales", query(collection(db, "sales"), orderBy("date", "desc")));
    subscribeCollection("users", query(collection(db, "users"), orderBy("displayName")));
    return;
  }

  subscribeCollection("children", query(collection(db, "children"), where("userId", "==", state.user.uid)), () => {
    clearDueSubscriptions();
    state.children.forEach((child) => {
      const unsubscribe = onSnapshot(
        query(collection(db, "dues"), where("childId", "==", child.id), orderBy("month", "desc")),
        (snapshot) => {
          const others = state.dues.filter((due) => due.childId !== child.id);
          state.dues = [...others, ...snapshot.docs.map(readDoc)];
          render();
        },
        showError,
      );
      unsubscribe.kind = "dues";
      state.unsubscribers.push(unsubscribe);
    });
  });
  subscribeCollection("products", query(collection(db, "products"), orderBy("name")));
}

function clearDueSubscriptions() {
  state.unsubscribers = state.unsubscribers.filter((unsubscribe) => {
    if (unsubscribe.kind !== "dues") return true;
    unsubscribe();
    return false;
  });
  state.dues = [];
}

function subscribeCollection(key, collectionQuery, afterUpdate) {
  const unsubscribe = onSnapshot(
    collectionQuery,
    (snapshot) => {
      state[key] = snapshot.docs.map(readDoc);
      if (!state.selectedChildId && state.children.length) state.selectedChildId = state.children[0].id;
      if (afterUpdate) afterUpdate();
      render();
    },
    showError,
  );
  state.unsubscribers.push(unsubscribe);
}

function readDoc(snapshot) {
  const data = snapshot.data();
  return { id: snapshot.id, ...data };
}

function stamp(data) {
  return { ...data, updatedAt: serverTimestamp() };
}

function showError(error) {
  state.notice = error.message || String(error);
  render();
}

function render() {
  if (!state.authReady) {
    appRoot.className = "auth-root";
    appRoot.innerHTML = `<main class="auth-screen"><section class="auth-card"><h1>Terreiro360</h1><p>Carregando...</p></section></main>`;
    return;
  }

  if (!state.user) {
    appRoot.className = "auth-root";
    appRoot.innerHTML = renderAuth();
    bindAuth();
    return;
  }

  if (!state.profile) {
    appRoot.className = "auth-root";
    appRoot.innerHTML = renderBootstrap();
    bindBootstrap();
    return;
  }

  const availableNav = navItems[state.profile.role] || navItems.basic;
  if (!availableNav.some(([id]) => id === state.view)) state.view = "dashboard";

  const viewMap = {
    dashboard: renderDashboard,
    children: renderChildren,
    dues: renderDues,
    payables: () => renderBills("payables"),
    receivables: () => renderBills("receivables"),
    sales: renderSales,
    products: renderProducts,
    users: renderUsers,
  };

  appRoot.className = "";
  appRoot.innerHTML = appShell(viewMap[state.view](), availableNav);
  bindGlobal();
  bindForms();
}

function renderAuth() {
  return `
    <main class="auth-screen">
      <section class="auth-card">
        <span class="brand-mark">T</span>
        <h1>Terreiro360</h1>
        <p>Entre com seu e-mail para acessar a gestão da casa.</p>
        ${notice()}
        <form data-form="login" class="stack">
          ${input("email", "E-mail", "email", true)}
          ${input("password", "Senha", "password", true)}
          <button class="primary" type="submit">${icon("shield")}Entrar</button>
          <button class="link-button" type="button" data-reset-password>Redefinir senha</button>
        </form>
        <div class="auth-divider"></div>
        <h2>Primeiro acesso</h2>
        <form data-form="signup-admin" class="stack">
          ${input("displayName", "Nome do administrador", "text", true)}
          ${input("email", "E-mail do administrador", "email", true)}
          ${input("password", "Senha", "password", true)}
          ${input("code", "Código de implantação", "password", true)}
          <button class="secondary wide-button" type="submit">${icon("plus")}Criar primeiro admin</button>
        </form>
      </section>
    </main>
  `;
}

function renderBootstrap() {
  return `
    <main class="auth-screen">
      <section class="auth-card">
        <span class="brand-mark">T</span>
        <h1>Primeiro administrador</h1>
        <p>Informe o código de implantação para ativar sua conta como administrador.</p>
        ${notice()}
        <form data-form="bootstrap" class="stack">
          ${input("displayName", "Nome", "text", true, auth.currentUser.displayName || "")}
          ${input("code", "Código de implantação", "password", true)}
          <button class="primary" type="submit">${icon("save")}Ativar admin</button>
          <button class="link-button" type="button" data-logout>Sair</button>
        </form>
      </section>
    </main>
  `;
}

function appShell(content, availableNav) {
  return `
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">T</span>
        <div><strong>Terreiro360</strong><small>Gestão da casa</small></div>
      </div>
      <nav>${availableNav.map(([id, label, iconName]) => `
        <button class="${state.view === id ? "active" : ""}" data-nav="${id}">${icon(iconName)}<span>${label}</span></button>
      `).join("")}</nav>
    </aside>
    <main class="workspace">
      <header class="topbar">
        <div>
          <p>${state.profile.role === "admin" ? "Administrador" : "Filho"}</p>
          <h1>${availableNav.find(([id]) => id === state.view)?.[1] || "Terreiro360"}</h1>
        </div>
        <button class="secondary" data-logout>${icon("logOut")}Sair</button>
      </header>
      ${notice()}
      ${content}
    </main>
  `;
}

function renderDashboard() {
  const data = totals();
  const pendingBills = state.payables.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount), 0);
  const isAdmin = state.profile.role === "admin";
  return `
    <section class="metrics">
      ${metric("Entradas", data.income, "positive")}
      ${metric("Saídas", data.expenses, "negative")}
      ${metric("Saldo", data.balance, data.balance >= 0 ? "positive" : "negative")}
      ${metric("Mensalidades em aberto", data.pendingDues, "warning")}
    </section>
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-head"><h2>${isAdmin ? "Fluxo financeiro" : "Minhas pendências"}</h2><span>tempo real</span></div>
        <div class="bars">
          ${bar("Entradas", data.income, Math.max(data.income, data.expenses, pendingBills, 1), "income")}
          ${bar("Saídas pagas", data.expenses, Math.max(data.income, data.expenses, pendingBills, 1), "expense")}
          ${bar("A pagar", pendingBills, Math.max(data.income, data.expenses, pendingBills, 1), "pending")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Resumo</h2><span>${state.children.length} cadastro(s)</span></div>
        <ul class="summary-list">
          <li><strong>${state.children.filter((child) => child.status === "active").length}</strong><span>filhos ativos</span></li>
          <li><strong>${state.products.reduce((sum, item) => sum + Number(item.stock || 0), 0)}</strong><span>itens em estoque</span></li>
          <li><strong>${state.sales.length}</strong><span>vendas registradas</span></li>
        </ul>
      </article>
    </section>
  `;
}

function renderChildren() {
  const isAdmin = state.profile.role === "admin";
  const rows = state.children.map((child) => `
    <tr>
      <td><strong>${escapeText(child.name)}</strong><small>${escapeText(child.spiritualName || "Sem nome religioso")}</small></td>
      <td>${escapeText(child.phone || "-")}</td>
      <td><span class="status ${child.status}">${child.status === "active" ? "Ativo" : "Saiu"}</span></td>
      <td>${child.joinDate || "-"}</td>
      ${isAdmin ? `<td><button class="icon-button danger" data-remove-child="${child.id}" title="Marcar saída">${icon("trash")}</button></td>` : ""}
    </tr>
  `).join("");

  if (!isAdmin) {
    return `<section class="panel table-panel"><div class="panel-head"><h2>Meu cadastro</h2><span>dados da casa</span></div>${table(["Nome", "Telefone", "Status", "Entrada"], rows)}</section>`;
  }

  return `
    <section class="split">
      <article class="panel">
        <div class="panel-head"><h2>Novo filho</h2><span>cadastro completo</span></div>
        <form data-form="child" class="stack">
          ${input("name", "Nome civil", "text", true)}
          ${input("spiritualName", "Nome religioso", "text")}
          ${input("phone", "Telefone", "tel", true)}
          ${input("email", "E-mail", "email")}
          <label>Usuário vinculado<select name="userId"><option value="">Sem login vinculado</option>${userOptions("basic")}</select></label>
          ${input("joinDate", "Entrada na casa", "date", true, today)}
          ${textarea("address", "Endereço")}
          ${textarea("obligations", "Obrigações e funções")}
          ${textarea("notes", "Observações")}
          <button class="primary" type="submit">${icon("plus")}Adicionar</button>
        </form>
      </article>
      <article class="panel table-panel">
        <div class="panel-head"><h2>Filhos da casa</h2><span>${state.children.length} pessoas</span></div>
        ${table(["Nome", "Telefone", "Status", "Entrada", ""], rows)}
      </article>
    </section>
  `;
}

function renderDues() {
  const isAdmin = state.profile.role === "admin";
  const childOptions = state.children.map((child) => `<option value="${child.id}" ${child.id === state.selectedChildId ? "selected" : ""}>${escapeText(child.name)}</option>`).join("");
  const rows = state.dues.map((due) => {
    const child = state.children.find((item) => item.id === due.childId);
    return `
      <tr>
        <td><strong>${escapeText(child?.name || "Cadastro removido")}</strong><small>${due.month}</small></td>
        <td>${currency.format(Number(due.amount || 0))}</td>
        <td><span class="status ${due.status}">${due.status === "paid" ? "Pago" : "Pendente"}</span></td>
        <td>${due.paidAt || "-"}</td>
        ${isAdmin ? `<td><button class="mini" data-toggle-due="${due.id}">${due.status === "paid" ? "Reabrir" : "Baixar"}</button></td>` : ""}
      </tr>
    `;
  }).join("");
  const selectedRows = state.dues.filter((due) => due.childId === state.selectedChildId);
  return `
    <section class="content-grid">
      ${isAdmin ? `
        <article class="panel">
          <div class="panel-head"><h2>Lançar mensalidade</h2><span>filho por filho</span></div>
          <form data-form="due" class="stack">
            <label>Filho<select name="childId" required>${childOptions}</select></label>
            ${input("month", "Mês", "month", true, today.slice(0, 7))}
            ${input("amount", "Valor", "number", true, "120")}
            <button class="primary" type="submit">${icon("plus")}Lançar</button>
          </form>
        </article>
      ` : ""}
      <article class="panel">
        <div class="panel-head"><h2>Consulta individual</h2><span>${state.children.find((child) => child.id === state.selectedChildId)?.name || "Selecione"}</span></div>
        <label>Filho<select data-select-child>${childOptions}</select></label>
        <ul class="summary-list compact">
          <li><strong>${selectedRows.length}</strong><span>mensalidades</span></li>
          <li><strong>${currency.format(selectedRows.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount || 0), 0))}</strong><span>em aberto</span></li>
        </ul>
      </article>
      <article class="panel table-panel wide">
        <div class="panel-head"><h2>Mensalidades</h2><span>${state.dues.length} lançamentos</span></div>
        ${table(["Filho", "Valor", "Status", "Pagamento", ...(isAdmin ? [""] : [])], rows)}
      </article>
    </section>
  `;
}

function renderBills(kind) {
  if (state.profile.role !== "admin") return renderForbidden();
  const isPayable = kind === "payables";
  const title = isPayable ? "Conta a pagar" : "Conta a receber";
  const items = state[kind];
  const rows = items.map((item) => `
    <tr>
      <td><strong>${escapeText(item.description)}</strong><small>${escapeText(isPayable ? item.category : item.source)}</small></td>
      <td>${item.dueDate}</td>
      <td>${currency.format(Number(item.amount || 0))}</td>
      <td><span class="status ${item.status}">${statusLabel(item.status)}</span></td>
      <td><button class="mini" data-toggle-bill="${kind}:${item.id}">${isPayable ? "Pagar" : "Receber"}</button></td>
    </tr>
  `).join("");
  return `
    <section class="split">
      <article class="panel">
        <div class="panel-head"><h2>${title}</h2><span>novo lançamento</span></div>
        <form data-form="${kind}" class="stack">
          ${input("description", "Descrição", "text", true)}
          ${input(isPayable ? "category" : "source", isPayable ? "Categoria" : "Origem", "text", true)}
          ${input("dueDate", "Vencimento", "date", true, today)}
          ${input("amount", "Valor", "number", true)}
          <button class="primary" type="submit">${icon("plus")}Adicionar</button>
        </form>
      </article>
      <article class="panel table-panel">
        <div class="panel-head"><h2>${isPayable ? "Contas a pagar" : "Contas a receber"}</h2><span>${items.length} itens</span></div>
        ${table(["Descrição", "Vencimento", "Valor", "Status", ""], rows)}
      </article>
    </section>
  `;
}

function renderProducts() {
  const isAdmin = state.profile.role === "admin";
  const rows = state.products.map((product) => `
    <tr>
      <td><strong>${escapeText(product.name)}</strong><small>${escapeText(product.category)}</small></td>
      <td>${currency.format(Number(product.price || 0))}</td>
      <td>${product.stock || 0}</td>
      ${isAdmin ? `<td><button class="icon-button danger" data-remove-product="${product.id}" title="Remover">${icon("trash")}</button></td>` : ""}
    </tr>
  `).join("");
  return `
    <section class="${isAdmin ? "split" : ""}">
      ${isAdmin ? `
        <article class="panel">
          <div class="panel-head"><h2>Novo produto</h2><span>estoque e preço</span></div>
          <form data-form="product" class="stack">
            ${input("name", "Produto", "text", true)}
            ${input("category", "Categoria", "text", true)}
            ${input("price", "Preço", "number", true)}
            ${input("stock", "Estoque", "number", true)}
            <button class="primary" type="submit">${icon("plus")}Salvar</button>
          </form>
        </article>
      ` : ""}
      <article class="panel table-panel">
        <div class="panel-head"><h2>Produtos</h2><span>${state.products.length} cadastrados</span></div>
        ${table(["Produto", "Preço", "Estoque", ...(isAdmin ? [""] : [])], rows)}
      </article>
    </section>
  `;
}

function renderSales() {
  if (state.profile.role !== "admin") return renderForbidden();
  const options = state.products.map((product) => `<option value="${product.id}">${escapeText(product.name)} - ${currency.format(Number(product.price || 0))}</option>`).join("");
  const rows = state.sales.map((sale) => `
    <tr>
      <td><strong>${escapeText(sale.productName)}</strong><small>${sale.date}</small></td>
      <td>${sale.quantity}</td>
      <td>${currency.format(Number(sale.total || 0))}</td>
    </tr>
  `).join("");
  return `
    <section class="split">
      <article class="panel">
        <div class="panel-head"><h2>Nova venda</h2><span>baixa no estoque</span></div>
        <form data-form="sale" class="stack">
          <label>Produto<select name="productId" required>${options}</select></label>
          ${input("quantity", "Quantidade", "number", true, "1")}
          ${input("buyer", "Comprador", "text")}
          <button class="primary" type="submit">${icon("save")}Registrar</button>
        </form>
      </article>
      <article class="panel table-panel">
        <div class="panel-head"><h2>Vendas</h2><span>${state.sales.length} registros</span></div>
        ${table(["Produto", "Qtd.", "Total"], rows)}
      </article>
    </section>
  `;
}

function renderUsers() {
  if (state.profile.role !== "admin") return renderForbidden();
  const rows = state.users.map((user) => `
    <tr>
      <td><strong>${escapeText(user.displayName)}</strong><small>${escapeText(user.email)}</small></td>
      <td><span class="status ${user.role === "admin" ? "paid" : "pending"}">${user.role === "admin" ? "Admin" : "Filho"}</span></td>
      <td><span class="status ${user.status}">${user.status === "active" ? "Ativo" : "Inativo"}</span></td>
      <td><button class="mini" data-toggle-user="${user.id}">${user.status === "active" ? "Inativar" : "Ativar"}</button></td>
    </tr>
  `).join("");
  return `
    <section class="split">
      <article class="panel">
        <div class="panel-head"><h2>Novo usuário</h2><span>login da casa</span></div>
        <form data-form="user" class="stack">
          ${input("displayName", "Nome", "text", true)}
          ${input("email", "E-mail", "email", true)}
          ${input("password", "Senha provisória", "password", true)}
          <label>Perfil<select name="role" required><option value="basic">Filho</option><option value="admin">Administrador</option></select></label>
          <button class="primary" type="submit">${icon("plus")}Criar login</button>
        </form>
      </article>
      <article class="panel table-panel">
        <div class="panel-head"><h2>Usuários</h2><span>${state.users.length} logins</span></div>
        ${table(["Usuário", "Perfil", "Status", ""], rows)}
      </article>
    </section>
  `;
}

function renderForbidden() {
  return `<section class="panel"><h2>Acesso restrito</h2><p class="muted">Esta área está disponível apenas para administradores.</p></section>`;
}

function totals() {
  const dueIncome = state.dues.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const received = state.receivables.filter((item) => item.status === "received").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const sales = state.sales.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const paid = state.payables.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingDues = state.dues.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return { income: dueIncome + received + sales, expenses: paid, balance: dueIncome + received + sales - paid, pendingDues };
}

function bindAuth() {
  document.querySelector('[data-form="login"]')?.addEventListener("submit", async (event) => {
    const data = formData(event);
    await runAction(() => signInWithEmailAndPassword(auth, data.email, data.password));
  });
  document.querySelector('[data-form="signup-admin"]')?.addEventListener("submit", async (event) => {
    const data = formData(event);
    await runAction(async () => {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(credential.user, { displayName: data.displayName });
      await setDoc(doc(db, "users", credential.user.uid), {
        displayName: data.displayName,
        email: data.email,
        role: "admin",
        status: "active",
        bootstrapCode: data.code,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", credential.user.uid), { bootstrapCode: deleteField() });
      await updateDoc(doc(db, "config", "bootstrap"), { enabled: false, usedAt: serverTimestamp(), usedBy: credential.user.uid });
      state.notice = "Administrador criado.";
      await loadCurrentProfile();
    });
  });
  document.querySelector("[data-reset-password]")?.addEventListener("click", async () => {
    const email = document.querySelector('[name="email"]')?.value;
    if (!email) {
      state.notice = "Informe o e-mail antes de redefinir a senha.";
      render();
      return;
    }
    await runAction(async () => {
      await sendPasswordResetEmail(auth, email);
      state.notice = "E-mail de redefinição enviado.";
    });
  });
}

function bindBootstrap() {
  document.querySelector('[data-form="bootstrap"]')?.addEventListener("submit", async (event) => {
    const data = formData(event);
    await runAction(async () => {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: data.displayName,
        email: auth.currentUser.email,
        role: "admin",
        status: "active",
        bootstrapCode: data.code,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { bootstrapCode: deleteField() });
      await updateDoc(doc(db, "config", "bootstrap"), { enabled: false, usedAt: serverTimestamp(), usedBy: auth.currentUser.uid });
      state.notice = "Administrador ativado.";
      await loadCurrentProfile();
    });
  });
  document.querySelector("[data-logout]")?.addEventListener("click", () => signOut(auth));
}

function bindGlobal() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.nav;
      render();
    });
  });
  document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", () => signOut(auth)));
}

function bindForms() {
  document.querySelector('[data-form="child"]')?.addEventListener("submit", handleChild);
  document.querySelector('[data-form="due"]')?.addEventListener("submit", handleDue);
  document.querySelector('[data-form="payables"]')?.addEventListener("submit", (event) => handleBill(event, "payables"));
  document.querySelector('[data-form="receivables"]')?.addEventListener("submit", (event) => handleBill(event, "receivables"));
  document.querySelector('[data-form="product"]')?.addEventListener("submit", handleProduct);
  document.querySelector('[data-form="sale"]')?.addEventListener("submit", handleSale);
  document.querySelector('[data-form="user"]')?.addEventListener("submit", handleUser);
  document.querySelector("[data-select-child]")?.addEventListener("change", (event) => {
    state.selectedChildId = event.target.value;
    render();
  });
  document.querySelectorAll("[data-remove-child]").forEach((button) => button.addEventListener("click", () => runAction(() => updateDoc(doc(db, "children", button.dataset.removeChild), stamp({ status: "inactive" })))));
  document.querySelectorAll("[data-toggle-due]").forEach((button) => button.addEventListener("click", async () => {
    const due = state.dues.find((item) => item.id === button.dataset.toggleDue);
    await runAction(() => updateDoc(doc(db, "dues", due.id), stamp({ status: due.status === "paid" ? "pending" : "paid", paidAt: due.status === "paid" ? "" : today })));
  }));
  document.querySelectorAll("[data-toggle-bill]").forEach((button) => button.addEventListener("click", async () => {
    const [kind, id] = button.dataset.toggleBill.split(":");
    await runAction(() => updateDoc(doc(db, kind, id), stamp({ status: kind === "payables" ? "paid" : "received" })));
  }));
  document.querySelectorAll("[data-remove-product]").forEach((button) => button.addEventListener("click", () => runAction(() => deleteDoc(doc(db, "products", button.dataset.removeProduct)))));
  document.querySelectorAll("[data-toggle-user]").forEach((button) => button.addEventListener("click", async () => {
    const user = state.users.find((item) => item.id === button.dataset.toggleUser);
    await runAction(() => updateDoc(doc(db, "users", user.id), stamp({ status: user.status === "active" ? "inactive" : "active" })));
  }));
}

async function handleChild(event) {
  const data = formData(event);
  await runAction(() => addDoc(collection(db, "children"), stamp({ ...data, status: "active", createdAt: serverTimestamp() })));
}

async function handleDue(event) {
  const data = formData(event);
  await runAction(() => addDoc(collection(db, "dues"), stamp({ ...data, amount: Number(data.amount), status: "pending", paidAt: "", createdAt: serverTimestamp() })));
}

async function handleBill(event, kind) {
  const data = formData(event);
  await runAction(() => addDoc(collection(db, kind), stamp({ ...data, amount: Number(data.amount), status: "pending", createdAt: serverTimestamp() })));
}

async function handleProduct(event) {
  const data = formData(event);
  await runAction(() => addDoc(collection(db, "products"), stamp({ ...data, price: Number(data.price), stock: Number(data.stock), createdAt: serverTimestamp() })));
}

async function handleSale(event) {
  const data = formData(event);
  const product = state.products.find((item) => item.id === data.productId);
  const quantity = Number(data.quantity);
  if (!product || quantity < 1 || Number(product.stock) < quantity) {
    state.notice = "Estoque insuficiente para esta venda.";
    render();
    return;
  }
  await runAction(async () => {
    await addDoc(collection(db, "sales"), stamp({
      productId: product.id,
      productName: product.name,
      quantity,
      buyer: data.buyer,
      total: quantity * Number(product.price),
      date: today,
      createdAt: serverTimestamp(),
    }));
    await updateDoc(doc(db, "products", product.id), stamp({ stock: Number(product.stock) - quantity }));
  });
}

async function handleUser(event) {
  const data = formData(event);
  await runAction(async () => {
    const secondary = initializeApp(firebaseConfig, `user-${Date.now()}`);
    const secondaryAuth = getAuth(secondary);
    const credential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
    await updateProfile(credential.user, { displayName: data.displayName });
    await setDoc(doc(db, "users", credential.user.uid), {
      displayName: data.displayName,
      email: data.email,
      role: data.role,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await signOut(secondaryAuth);
    await deleteApp(secondary);
    state.notice = "Usuário criado. Ele já pode entrar com a senha provisória.";
  });
}

async function runAction(action) {
  try {
    state.notice = "";
    await action();
  } catch (error) {
    state.notice = friendlyError(error);
    render();
  }
}

async function loadCurrentProfile() {
  if (!auth.currentUser) return;
  clearSubscriptions();
  const profileSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (!profileSnap.exists()) return;
  state.user = auth.currentUser;
  state.profile = { id: profileSnap.id, ...profileSnap.data() };
  state.view = "dashboard";
  subscribeData();
  render();
}

function formData(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  event.target.reset();
  return data;
}

function friendlyError(error) {
  const message = error.message || String(error);
  const map = {
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/invalid-credential": "E-mail ou senha inválidos.",
    "auth/weak-password": "Use uma senha com pelo menos 6 caracteres.",
    "auth/operation-not-allowed": "Login por e-mail/senha ainda não está habilitado no Firebase Authentication.",
    "permission-denied": "Permissão negada. Verifique seu perfil de acesso.",
  };
  return Object.entries(map).find(([code]) => message.includes(code))?.[1] || message;
}

function input(name, label, type, required = false, value = "") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeAttr(value)}" ${required ? "required" : ""} /></label>`;
}

function textarea(name, label) {
  return `<label>${label}<textarea name="${name}" rows="3"></textarea></label>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}">Nenhum registro.</td></tr>`}</tbody></table></div>`;
}

function userOptions(role) {
  return state.users
    .filter((user) => user.role === role && user.status === "active")
    .map((user) => `<option value="${user.id}">${escapeText(user.displayName)} (${escapeText(user.email)})</option>`)
    .join("");
}

function metric(label, value, tone) {
  return `<article class="metric ${tone}"><span>${label}</span><strong>${currency.format(value)}</strong></article>`;
}

function bar(label, value, max, tone) {
  const width = max ? Math.max(6, (value / max) * 100) : 6;
  return `<div class="bar-row"><span>${label}</span><div><i class="${tone}" style="width:${width}%"></i></div><strong>${currency.format(value)}</strong></div>`;
}

function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${iconPaths[name] || iconPaths.plus}"/></svg>`;
}

function statusLabel(status) {
  return ({ pending: "Pendente", paid: "Pago", received: "Recebido", active: "Ativo", inactive: "Inativo" })[status] || status;
}

function notice() {
  return state.notice ? `<div class="notice">${escapeText(state.notice)}</div>` : "";
}

function escapeText(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value = "") {
  return escapeText(value);
}
