const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const today = new Date().toISOString().slice(0, 10);

const seed = {
  currentUser: { name: "Administrador", role: "admin" },
  children: [
    {
      id: crypto.randomUUID(),
      name: "Ana Beatriz Santos",
      spiritualName: "Yalode",
      phone: "(11) 90000-1100",
      email: "ana@example.com",
      joinDate: "2024-02-18",
      status: "active",
      address: "Rua das Palmeiras, 120",
      obligations: "Mensalidade, festas e limpeza mensal",
      notes: "Confirmar dados de emergencia.",
    },
    {
      id: crypto.randomUUID(),
      name: "Marcos Oliveira",
      spiritualName: "Ogã Marcos",
      phone: "(21) 98888-2211",
      email: "marcos@example.com",
      joinDate: "2023-09-02",
      status: "active",
      address: "Av. Central, 44",
      obligations: "Mensalidade e apoio musical",
      notes: "",
    },
  ],
  dues: [],
  payables: [
    {
      id: crypto.randomUUID(),
      description: "Aluguel do espaço",
      category: "Estrutura",
      dueDate: today,
      amount: 1800,
      status: "pending",
    },
    {
      id: crypto.randomUUID(),
      description: "Energia",
      category: "Serviços",
      dueDate: today,
      amount: 420,
      status: "paid",
    },
  ],
  receivables: [
    {
      id: crypto.randomUUID(),
      description: "Contribuição festa",
      source: "Comunidade",
      dueDate: today,
      amount: 950,
      status: "received",
    },
  ],
  products: [
    {
      id: crypto.randomUUID(),
      name: "Vela branca",
      category: "Artigos",
      price: 8,
      stock: 42,
    },
    {
      id: crypto.randomUUID(),
      name: "Guia simples",
      category: "Artigos",
      price: 35,
      stock: 12,
    },
  ],
  sales: [],
};

seed.dues = seed.children.map((child, index) => ({
  id: crypto.randomUUID(),
  childId: child.id,
  month: "2026-06",
  amount: 120,
  status: index === 0 ? "paid" : "pending",
  paidAt: index === 0 ? "2026-06-05" : "",
}));

const navItems = [
  ["dashboard", "Painel", "bar-chart-3"],
  ["children", "Filhos", "users"],
  ["dues", "Mensalidades", "calendar-check"],
  ["payables", "A pagar", "receipt"],
  ["receivables", "A receber", "wallet"],
  ["sales", "Vendas", "shopping-bag"],
  ["products", "Produtos", "package"],
  ["users", "Usuários", "shield"],
];

const state = loadState();
let activeView = "dashboard";
let selectedChildId = state.children[0]?.id || "";

function loadState() {
  const saved = localStorage.getItem("terreiro360");
  if (!saved) return structuredClone(seed);
  try {
    return { ...structuredClone(seed), ...JSON.parse(saved) };
  } catch {
    return structuredClone(seed);
  }
}

function persist() {
  localStorage.setItem("terreiro360", JSON.stringify(state));
}

function icon(name) {
  const map = {
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
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${map[name] || map.plus}"/></svg>`;
}

function appShell(content) {
  return `
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">T</span>
        <div>
          <strong>Terreiro360</strong>
          <small>Gestão da casa</small>
        </div>
      </div>
      <nav>${navItems.map(([id, label, iconName]) => `
        <button class="${activeView === id ? "active" : ""}" data-nav="${id}">
          ${icon(iconName)}<span>${label}</span>
        </button>
      `).join("")}</nav>
    </aside>
    <main class="workspace">
      <header class="topbar">
        <div>
          <p>${state.currentUser.role === "admin" ? "Administrador" : "Filho"}</p>
          <h1>${navItems.find(([id]) => id === activeView)?.[1]}</h1>
        </div>
        <div class="role-switch" role="group" aria-label="Tipo de usuario">
          <button class="${state.currentUser.role === "admin" ? "active" : ""}" data-role="admin">Admin</button>
          <button class="${state.currentUser.role === "basic" ? "active" : ""}" data-role="basic">Filho</button>
        </div>
      </header>
      ${content}
    </main>
  `;
}

function render() {
  const views = {
    dashboard: renderDashboard,
    children: renderChildren,
    dues: renderDues,
    payables: () => renderBills("payables"),
    receivables: () => renderBills("receivables"),
    sales: renderSales,
    products: renderProducts,
    users: renderUsers,
  };
  document.querySelector("#app").innerHTML = appShell(views[activeView]());
  bindGlobal();
  bindForms();
}

function totals() {
  const dueIncome = state.dues.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amount), 0);
  const received = state.receivables.filter((item) => item.status === "received").reduce((sum, item) => sum + Number(item.amount), 0);
  const sales = state.sales.reduce((sum, item) => sum + Number(item.total), 0);
  const paid = state.payables.filter((item) => item.status === "paid").reduce((sum, item) => sum + Number(item.amount), 0);
  const pendingDues = state.dues.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount), 0);
  return { income: dueIncome + received + sales, expenses: paid, balance: dueIncome + received + sales - paid, pendingDues };
}

function renderDashboard() {
  const data = totals();
  const pendingBills = state.payables.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount), 0);
  return `
    <section class="metrics">
      ${metric("Entradas", data.income, "positive")}
      ${metric("Saídas", data.expenses, "negative")}
      ${metric("Saldo", data.balance, data.balance >= 0 ? "positive" : "negative")}
      ${metric("Mensalidades em aberto", data.pendingDues, "warning")}
    </section>
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-head"><h2>Fluxo financeiro</h2><span>mês atual</span></div>
        <div class="bars">
          ${bar("Entradas", data.income, Math.max(data.income, data.expenses, pendingBills), "income")}
          ${bar("Saídas pagas", data.expenses, Math.max(data.income, data.expenses, pendingBills), "expense")}
          ${bar("A pagar", pendingBills, Math.max(data.income, data.expenses, pendingBills), "pending")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Resumo da casa</h2><span>${state.children.length} cadastros</span></div>
        <ul class="summary-list">
          <li><strong>${state.children.filter((child) => child.status === "active").length}</strong><span>filhos ativos</span></li>
          <li><strong>${state.products.reduce((sum, item) => sum + Number(item.stock), 0)}</strong><span>itens em estoque</span></li>
          <li><strong>${state.sales.length}</strong><span>vendas registradas</span></li>
        </ul>
      </article>
    </section>
  `;
}

function metric(label, value, tone) {
  return `<article class="metric ${tone}"><span>${label}</span><strong>${currency.format(value)}</strong></article>`;
}

function bar(label, value, max, tone) {
  const width = max ? Math.max(6, (value / max) * 100) : 6;
  return `<div class="bar-row"><span>${label}</span><div><i class="${tone}" style="width:${width}%"></i></div><strong>${currency.format(value)}</strong></div>`;
}

function renderChildren() {
  const rows = state.children.map((child) => `
    <tr>
      <td><strong>${child.name}</strong><small>${child.spiritualName || "Sem nome religioso"}</small></td>
      <td>${child.phone}</td>
      <td><span class="status ${child.status}">${child.status === "active" ? "Ativo" : "Saiu"}</span></td>
      <td>${child.joinDate}</td>
      <td><button class="icon-button danger" data-remove-child="${child.id}" title="Remover">${icon("trash")}</button></td>
    </tr>
  `).join("");
  return `
    <section class="split">
      <article class="panel">
        <div class="panel-head"><h2>Novo filho</h2><span>cadastro completo</span></div>
        <form data-form="child" class="stack">
          ${input("name", "Nome civil", "text", true)}
          ${input("spiritualName", "Nome religioso", "text")}
          ${input("phone", "Telefone", "tel", true)}
          ${input("email", "E-mail", "email")}
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
  const childOptions = state.children.map((child) => `<option value="${child.id}" ${child.id === selectedChildId ? "selected" : ""}>${child.name}</option>`).join("");
  const rows = state.dues.map((due) => {
    const child = state.children.find((item) => item.id === due.childId);
    return `
      <tr>
        <td><strong>${child?.name || "Cadastro removido"}</strong><small>${due.month}</small></td>
        <td>${currency.format(Number(due.amount))}</td>
        <td><span class="status ${due.status}">${due.status === "paid" ? "Pago" : "Pendente"}</span></td>
        <td>${due.paidAt || "-"}</td>
        <td><button class="mini" data-toggle-due="${due.id}">${due.status === "paid" ? "Reabrir" : "Baixar"}</button></td>
      </tr>
    `;
  }).join("");
  const selected = state.children.find((child) => child.id === selectedChildId);
  const selectedRows = state.dues.filter((due) => due.childId === selectedChildId);
  return `
    <section class="content-grid">
      <article class="panel">
        <div class="panel-head"><h2>Lançar mensalidade</h2><span>filho por filho</span></div>
        <form data-form="due" class="stack">
          <label>Filho<select name="childId" required>${childOptions}</select></label>
          ${input("month", "Mês", "month", true, "2026-06")}
          ${input("amount", "Valor", "number", true, "120")}
          <button class="primary" type="submit">${icon("plus")}Lançar</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Consulta individual</h2><span>${selected?.name || "Selecione"}</span></div>
        <label>Filho<select data-select-child>${childOptions}</select></label>
        <ul class="summary-list compact">
          <li><strong>${selectedRows.length}</strong><span>mensalidades</span></li>
          <li><strong>${currency.format(selectedRows.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount), 0))}</strong><span>em aberto</span></li>
        </ul>
      </article>
      <article class="panel table-panel wide">
        <div class="panel-head"><h2>Mensalidades gerais</h2><span>${state.dues.length} lançamentos</span></div>
        ${table(["Filho", "Valor", "Status", "Pagamento", ""], rows)}
      </article>
    </section>
  `;
}

function renderBills(kind) {
  const isPayable = kind === "payables";
  const title = isPayable ? "Conta a pagar" : "Conta a receber";
  const items = state[kind];
  const rows = items.map((item) => `
    <tr>
      <td><strong>${item.description}</strong><small>${isPayable ? item.category : item.source}</small></td>
      <td>${item.dueDate}</td>
      <td>${currency.format(Number(item.amount))}</td>
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
  const rows = state.products.map((product) => `
    <tr>
      <td><strong>${product.name}</strong><small>${product.category}</small></td>
      <td>${currency.format(Number(product.price))}</td>
      <td>${product.stock}</td>
      <td><button class="icon-button danger" data-remove-product="${product.id}" title="Remover">${icon("trash")}</button></td>
    </tr>
  `).join("");
  return `
    <section class="split">
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
      <article class="panel table-panel">
        <div class="panel-head"><h2>Produtos</h2><span>${state.products.length} cadastrados</span></div>
        ${table(["Produto", "Preço", "Estoque", ""], rows)}
      </article>
    </section>
  `;
}

function renderSales() {
  const options = state.products.map((product) => `<option value="${product.id}">${product.name} - ${currency.format(Number(product.price))}</option>`).join("");
  const rows = state.sales.map((sale) => `
    <tr>
      <td><strong>${sale.productName}</strong><small>${sale.date}</small></td>
      <td>${sale.quantity}</td>
      <td>${currency.format(Number(sale.total))}</td>
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
  return `
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-head"><h2>Modelo de usuários</h2><span>Firebase Auth</span></div>
        <div class="permission-grid">
          <div><strong>Administrador</strong><p>Cria e remove cadastros, lança mensalidades, controla contas, produtos, vendas e consulta todos os relatórios.</p></div>
          <div><strong>Filho</strong><p>Acessa dados próprios, mensalidades, avisos financeiros permitidos e histórico individual.</p></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Sessão demo</h2><span>troque no topo</span></div>
        <p class="muted">A primeira versão está pronta para autenticação real no Firebase. A troca Admin/Filho simula as permissões durante o desenho da interface.</p>
      </article>
    </section>
  `;
}

function input(name, label, type, required = false, value = "") {
  return `<label>${label}<input name="${name}" type="${type}" value="${value}" ${required ? "required" : ""} /></label>`;
}

function textarea(name, label) {
  return `<label>${label}<textarea name="${name}" rows="3"></textarea></label>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}">Nenhum registro.</td></tr>`}</tbody></table></div>`;
}

function statusLabel(status) {
  return ({ pending: "Pendente", paid: "Pago", received: "Recebido", active: "Ativo", inactive: "Saiu" })[status] || status;
}

function bindGlobal() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.nav;
      render();
    });
  });
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentUser.role = button.dataset.role;
      persist();
      render();
    });
  });
}

function bindForms() {
  document.querySelector('[data-form="child"]')?.addEventListener("submit", handleChild);
  document.querySelector('[data-form="due"]')?.addEventListener("submit", handleDue);
  document.querySelector('[data-form="payables"]')?.addEventListener("submit", (event) => handleBill(event, "payables"));
  document.querySelector('[data-form="receivables"]')?.addEventListener("submit", (event) => handleBill(event, "receivables"));
  document.querySelector('[data-form="product"]')?.addEventListener("submit", handleProduct);
  document.querySelector('[data-form="sale"]')?.addEventListener("submit", handleSale);
  document.querySelector("[data-select-child]")?.addEventListener("change", (event) => {
    selectedChildId = event.target.value;
    render();
  });
  document.querySelectorAll("[data-remove-child]").forEach((button) => button.addEventListener("click", () => {
    const child = state.children.find((item) => item.id === button.dataset.removeChild);
    if (child) child.status = "inactive";
    persist();
    render();
  }));
  document.querySelectorAll("[data-toggle-due]").forEach((button) => button.addEventListener("click", () => {
    const due = state.dues.find((item) => item.id === button.dataset.toggleDue);
    due.status = due.status === "paid" ? "pending" : "paid";
    due.paidAt = due.status === "paid" ? today : "";
    persist();
    render();
  }));
  document.querySelectorAll("[data-toggle-bill]").forEach((button) => button.addEventListener("click", () => {
    const [kind, id] = button.dataset.toggleBill.split(":");
    const item = state[kind].find((entry) => entry.id === id);
    item.status = kind === "payables" ? "paid" : "received";
    persist();
    render();
  }));
  document.querySelectorAll("[data-remove-product]").forEach((button) => button.addEventListener("click", () => {
    state.products = state.products.filter((item) => item.id !== button.dataset.removeProduct);
    persist();
    render();
  }));
}

function formData(event) {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.target).entries());
}

function handleChild(event) {
  const data = formData(event);
  state.children.push({ id: crypto.randomUUID(), status: "active", ...data });
  selectedChildId = state.children.at(-1).id;
  event.target.reset();
  persist();
  render();
}

function handleDue(event) {
  const data = formData(event);
  state.dues.push({ id: crypto.randomUUID(), status: "pending", paidAt: "", ...data, amount: Number(data.amount) });
  persist();
  render();
}

function handleBill(event, kind) {
  const data = formData(event);
  state[kind].push({
    id: crypto.randomUUID(),
    status: kind === "payables" ? "pending" : "pending",
    ...data,
    amount: Number(data.amount),
  });
  event.target.reset();
  persist();
  render();
}

function handleProduct(event) {
  const data = formData(event);
  state.products.push({ id: crypto.randomUUID(), ...data, price: Number(data.price), stock: Number(data.stock) });
  event.target.reset();
  persist();
  render();
}

function handleSale(event) {
  const data = formData(event);
  const product = state.products.find((item) => item.id === data.productId);
  const quantity = Number(data.quantity);
  if (!product || quantity < 1 || product.stock < quantity) return;
  product.stock -= quantity;
  state.sales.push({
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    quantity,
    buyer: data.buyer,
    total: quantity * Number(product.price),
    date: today,
  });
  event.target.reset();
  persist();
  render();
}

render();
