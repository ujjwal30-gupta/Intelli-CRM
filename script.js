
// ==========================================
// INTELLI CRM - AI & ANALYTICS EDITION
// FRONTEND DEMONSTRATION APPLICATION
// ==========================================

const getUsers = () => JSON.parse(localStorage.getItem("intelli_users") || "[]");
const saveUsers = data => localStorage.setItem("intelli_users",JSON.stringify(data));
const getCustomers = () => JSON.parse(localStorage.getItem("intelli_customers") || "[]");
const saveCustomers = data => localStorage.setItem("intelli_customers",JSON.stringify(data));

let currentUser = JSON.parse(sessionStorage.getItem("intelli_session") || "null");
const API_URL = "http://localhost:5000/api";

let authToken = sessionStorage.getItem("intelli_token") || "";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {})
    }
    
  });
  async function askIntelliAI(message) {
  const result = await apiRequest("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });
async function sendAIMessage() {
  const input = document.getElementById("aiInput");
  const messages = document.getElementById("aiMessages");
  const button = document.getElementById("aiSendBtn");

  const message = input.value.trim();

  if (!message) {
    showToast("Please enter a message!");
    return;
  }

  messages.innerHTML += `<p><b>You:</b> ${escapeHTML(message)}</p>`;

  input.value = "";
  button.disabled = true;
  button.textContent = "Thinking...";

  try {
    const reply = await askIntelliAI(message);

    const aiMessage = document.createElement("p");
    const label = document.createElement("b");

    label.textContent = "AI: ";
    aiMessage.appendChild(label);
    aiMessage.appendChild(document.createTextNode(reply));

    messages.appendChild(aiMessage);

  } catch (error) {
    showToast("AI Error: " + error.message);
    console.error(error);
  }

  button.disabled = false;
  button.textContent = "Send Message";
  messages.scrollTop = messages.scrollHeight;
}
  return result.reply;
}

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}
let authRole = "consumer";
let authMode = "login";
let charts = {};

const consumerMenu = [
  ["overview","▦","Dashboard"],
  ["customers","♙","Customers"],
  ["analytics","▥","Business Analytics"],
  ["assistant","✦","AI Assistant"],
  ["reports","▤","Reports"],
  ["profile","◉","My Profile"],
  ["settings","⚙","Settings"]
];

const sellerMenu = [
  ["overview","▦","Dashboard"],
  ["seller","♙","Consumers"],
  ["plans","◇","Subscription Plans"],
  ["profile","◉","My Profile"],
  ["settings","⚙","Settings"]
];

const plans = [
  {name:"Basic",price:"499",desc:"For small businesses.",features:["Customer record management","Basic CRM dashboard","Customer search","Email support"]},
  {name:"Intermediate",price:"999",desc:"For growing businesses.",features:["Everything in Basic","Advanced customer management","Business analytics","Priority support"]},
  {name:"Advanced",price:"1,999",desc:"For established businesses.",features:["Everything in Intermediate","Advanced insights","Performance reports","Premium support"]}
];

// ==========================================
// NAVIGATION AND AUTHENTICATION
// ==========================================

function showPage(id) {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

function openAuth(role,mode) {
  authRole=role;
  authMode=mode;
  showPage("authPage");
  updateAuth();
}

function switchAuth(mode) {
  authMode=mode;
  updateAuth();
}

function updateAuth() {
  const registering=authMode==="register";
  const seller=authRole==="seller";

  document.getElementById("authRole").textContent=seller?"SELLER ACCOUNT":"CONSUMER ACCOUNT";
  document.getElementById("authTitle").textContent=registering?"Create Your Account":"Welcome Back!";
  document.getElementById("authSubtitle").textContent=registering?"Enter your details to get started.":"Login to access your account.";

  document.getElementById("nameField").classList.toggle("hidden",!registering);
  document.getElementById("emailField").classList.toggle("hidden",!registering);
  document.getElementById("planField").classList.toggle("hidden",!registering||!seller);

  document.getElementById("fullName").required=registering;
  document.getElementById("email").required=registering;

  document.getElementById("loginTab").classList.toggle("active",!registering);
  document.getElementById("registerTab").classList.toggle("active",registering);

  document.getElementById("authSubmit").textContent=registering?"Create Account →":"Login to Account →";
  document.getElementById("authSwitch").innerHTML=registering
    ?'Already registered? <a onclick="switchAuth(\'login\')">Login here</a>'
    :'New to Intelli CRM? <a onclick="switchAuth(\'register\')">Create an account</a>';

  document.getElementById("authForm").reset();
  document.getElementById("authError").textContent="";
}

document.getElementById("authForm").addEventListener("submit", async e => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("authError");

  if (!/^[A-Za-z0-9]{3,20}$/.test(username)) {
    error.textContent = "Username must contain 3-20 letters or numbers.";
    return;
  }

  if (password.length < 8) {
    error.textContent = "Password must contain at least 8 characters.";
    return;
  }

  try {
    error.textContent = "Please wait...";

    let result;

    if (authMode === "register") {
      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();

      const plan = authRole === "seller"
        ? document.getElementById("sellerPlan").value
        : "Basic";

      if (!fullName || !email) {
        error.textContent = "Please fill all required fields.";
        return;
      }

      result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
          role: authRole,
          plan
        })
      });

      showToast("Registration successful! Please login.");

      authMode = "login";
      updateAuth();
      return;

    } else {
      result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password
        })
      });
    }

    authToken = result.token;

    sessionStorage.setItem("intelli_token", authToken);

    const user = {
      id: result.user.id,
      name: result.user.fullName,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
      plan: result.user.plan,
      createdAt: new Date().toISOString()
    };

    loginUser(user);
    showToast("Login successful!");

  } catch (err) {
    error.textContent = err.message;
  }
});
function loginUser(user) {
  currentUser = user;

  sessionStorage.setItem(
    "intelli_session",
    JSON.stringify(user)
  );

  loadDashboard();
  showPage("dashboardPage");
}

// ==========================================
// DASHBOARD
// ==========================================

function loadDashboard(){
  if(!currentUser)return;

  const first=currentUser.name.charAt(0).toUpperCase();

  document.getElementById("sideName").textContent=currentUser.name;
  document.getElementById("sideRole").textContent=currentUser.role;
  document.getElementById("sideAvatar").textContent=first;
  document.getElementById("headerName").textContent=currentUser.name;
  document.getElementById("headerRole").textContent=currentUser.role;
  document.getElementById("headerAvatar").textContent=first;
  document.getElementById("welcomeName").textContent="Welcome, "+currentUser.name+"!";

  const menu=currentUser.role==="seller"?sellerMenu:consumerMenu;

  document.getElementById("sidebarMenu").innerHTML=menu.map(item=>`
    <button class="menu-item" data-section="${item[0]}" onclick="navigate('${item[0]}')">
      <span class="menu-symbol">${item[1]}</span>${item[2]}
    </button>
  `).join("");

  renderProfile();
  renderPlans();
  navigate("overview");
}

function navigate(section){
  const allowed=currentUser.role==="seller"
    ?["overview","seller","plans","profile","settings"]
    :["overview","customers","analytics","assistant","reports","profile","settings"];

  if(!allowed.includes(section))return;

  document.querySelectorAll(".dash-section").forEach(s=>s.classList.add("hidden"));
  const target=document.getElementById(section+"Section");
  if(target)target.classList.remove("hidden");

  document.querySelectorAll(".menu-item").forEach(item=>{
    item.classList.toggle("active",item.dataset.section===section);
  });

  const titles={
    overview:"Dashboard Overview",customers:"Customer Management",
    analytics:"Business Analytics",assistant:"AI Business Assistant",
    reports:"Business Reports",seller:"Seller Dashboard",
    plans:"Subscription Plans",profile:"My Profile",settings:"Settings"
  };

  document.getElementById("pageTitle").textContent=titles[section];
  document.getElementById("breadcrumb").textContent=titles[section].toUpperCase();

  if(section==="overview")renderOverview();
  if(section==="customers")renderCustomers();
  if(section==="analytics")renderAnalytics();
  if(section==="assistant")renderQuickInsights();
  if(section==="reports")renderReport();
  if(section==="seller")renderSeller();
  if(section==="plans")renderPlans();

  document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar(){
  document.getElementById("sidebar").classList.toggle("open");
}

async function refreshCustomers() {
  const result = await apiRequest("/customers");

  const list = Array.isArray(result)
    ? result
    : (result.customers || result.data || []);

  const customers = list.map(c => ({
    id: c._id,
    ownerId: currentUser.id,
    name: c.name,
    email: c.email || "",
    phone: c.phone || "",
    company: c.company || "",
    address: c.address || "",
    createdAt: c.createdAt
  }));

  saveCustomers(customers);
}

function myCustomers() {
  return getCustomers().filter(c => c.ownerId === currentUser.id);
}

// ==========================================
// OVERVIEW
// ==========================================

function renderOverview(){
  if(currentUser.role==="seller"){
    const consumers=getUsers().filter(u=>u.role==="consumer");
    document.getElementById("statsGrid").innerHTML=`
      ${stat("Registered Consumers",consumers.length,"Consumer accounts","♙")}
      ${stat("Subscription Plans",3,"Available plans","◇")}
      ${stat("Your Plan",currentUser.plan,"Selected plan","✦")}
      ${stat("Account Status","Active","Demo account","●")}
    `;
    document.getElementById("recentCustomers").innerHTML=
      "<p>Open the Consumers section to view registered accounts.</p>";
    return;
  }

  const c=myCustomers();
  const companies=new Set(c.map(x=>x.company).filter(Boolean)).size;

  document.getElementById("statsGrid").innerHTML=`
    ${stat("Total Customers",c.length,"Saved customer records","♙")}
    ${stat("Companies",companies,"Unique companies","▤")}
    ${stat("This Month",c.filter(x=>isThisMonth(x.createdAt)).length,"New records","↗")}
    ${stat("Account Status","Active","Consumer account","●")}
  `;

  document.getElementById("recentCustomers").innerHTML=c.length
    ?c.slice(-5).reverse().map(x=>`
      <div class="quick-row"><b>${escapeHTML(x.name)}</b><span>${escapeHTML(x.company||"Individual")}</span></div>
    `).join("")
    :'<div class="empty-state"><div>♙</div><h3>No customers yet</h3><p>Add your first customer to get started.</p><button class="btn primary" onclick="navigate(\'customers\')">Add Customer</button></div>';
}

function stat(label,value,description,symbol){
  return `<div class="stat-card"><div class="stat-top">${label}<span class="stat-icon">${symbol}</span></div><h2>${value}</h2><small>${description}</small></div>`;
}

function isThisMonth(date){
  const d=new Date(date),n=new Date();
  return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();
}

// ==========================================
// CUSTOMER CRUD
// ==========================================

function renderCustomers(){
  const search=(document.getElementById("customerSearch").value||"").toLowerCase();

  const filtered=myCustomers().filter(c=>
    [c.name,c.email,c.phone,c.company].some(v=>(v||"").toLowerCase().includes(search))
  );

  document.getElementById("customerCount").textContent=filtered.length+" customers";

  document.getElementById("customerTable").innerHTML=filtered.map(c=>`
    <tr>
      <td><span class="table-avatar">${escapeHTML(c.name.charAt(0).toUpperCase())}</span><strong>${escapeHTML(c.name)}</strong></td>
      <td>${escapeHTML(c.email)}</td><td>${escapeHTML(c.phone||"-")}</td>
      <td>${escapeHTML(c.company||"-")}</td>
      <td><button class="action-btn" onclick="openCustomerForm('${c.id}')">Edit</button><button class="action-btn delete" onclick="deleteCustomer('${c.id}')">Delete</button></td>
    </tr>
  `).join("");

  document.getElementById("emptyCustomers").classList.toggle("hidden",filtered.length>0);
}

function openCustomerForm(id=null){
  document.getElementById("customerForm").reset();
  document.getElementById("editCustomerId").value="";
  document.getElementById("modalTitle").textContent=id?"Update Customer":"Add Customer";

  if(id){
    const c=myCustomers().find(x=>x.id===id);
    if(!c)return;
    document.getElementById("editCustomerId").value=c.id;
    document.getElementById("customerName").value=c.name;
    document.getElementById("customerEmail").value=c.email;
    document.getElementById("customerPhone").value=c.phone;
    document.getElementById("customerCompany").value=c.company;
    document.getElementById("customerAddress").value=c.address;
  }

  document.getElementById("customerModal").classList.remove("hidden");
}

function closeCustomerForm(){
  document.getElementById("customerModal").classList.add("hidden");
}

document.getElementById("customerForm").addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("editCustomerId").value;

  const record = {
    name: document.getElementById("customerName").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    company: document.getElementById("customerCompany").value.trim(),
    address: document.getElementById("customerAddress").value.trim()
  };

  try {
    await apiRequest(
      id ? `/customers/${id}` : "/customers",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(record)
      }
    );

    await refreshCustomers();
    closeCustomerForm();
    renderCustomers();
    renderOverview();

    showToast("Customer saved successfully!");

  } catch (error) {
    showToast(error.message);
    console.error("Customer API Error:", error);
  }
});

function deleteCustomer(id){
  if(!confirm("Delete this customer record?"))return;
  saveCustomers(getCustomers().filter(c=>!(c.id===id&&c.ownerId===currentUser.id)));
  renderCustomers();
  renderOverview();
  showToast("Customer deleted!");
}

// ==========================================
// ANALYTICS ENGINE
// ==========================================

function analyticsData(){
  const customers=myCustomers();
  const now=new Date();

  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    months.push({
      label:d.toLocaleString("en-US",{month:"short"}),
      month:d.getMonth(),
      year:d.getFullYear(),
      count:0
    });
  }

  customers.forEach(c=>{
    const d=new Date(c.createdAt);
    const m=months.find(x=>x.month===d.getMonth()&&x.year===d.getFullYear());
    if(m)m.count++;
  });

  const companyCounts={};
  customers.forEach(c=>{
    const key=c.company?.trim()||"Individual";
    companyCounts[key]=(companyCounts[key]||0)+1;
  });

  const entries=Object.entries(companyCounts).sort((a,b)=>b[1]-a[1]);
  return {customers,months,entries};
}

function destroyCharts(){
  Object.values(charts).forEach(chart=>chart.destroy());
  charts={};
}

function renderAnalytics(){
  const data=analyticsData();
  const total=data.customers.length;
  const companies=new Set(data.customers.map(c=>c.company).filter(Boolean)).size;
  const recent=data.customers.filter(c=>{
    const d=new Date(c.createdAt),n=new Date();
    return (n-d)/(1000*60*60*24)<=30;
  }).length;

  document.getElementById("analyticsStats").innerHTML=`
    ${stat("Total Customers",total,"Total saved records","♙")}
    ${stat("Business Companies",companies,"Unique companies","▤")}
    ${stat("New in 30 Days",recent,"Recent customer additions","↗")}
    ${stat("Customer Categories",data.entries.length,"Company / individual groups","◇")}
  `;

  const labels=data.months.map(m=>m.label);
  const growth=data.months.map(m=>m.count);

  const distributionLabels=data.entries.length?data.entries.map(x=>x[0]):["No Data"];
  const distributionValues=data.entries.length?data.entries.map(x=>x[1]):[1];

  const companyLabels=data.entries.length?data.entries.slice(0,7).map(x=>x[0]):["No Data"];
  const companyValues=data.entries.length?data.entries.slice(0,7).map(x=>x[1]):[0];

  if(typeof Chart==="undefined"){
    document.getElementById("reportContent").innerHTML="<p>Charts need an internet connection to load Chart.js.</p>";
    return;
  }

  destroyCharts();

  const common={
    responsive:true,
    maintainAspectRatio:false,
    plugins:{legend:{labels:{font:{size:10}}}}
  };

  charts.growth=new Chart(document.getElementById("growthChart"),{
    type:"line",
    data:{labels,datasets:[{
      label:"New Customers",
      data:growth,
      borderColor:"#4263eb",
      backgroundColor:"rgba(66,99,235,.13)",
      fill:true,
      tension:.4,
      pointRadius:4
    }]},
    options:{...common,scales:{y:{beginAtZero:true,ticks:{precision:0}}}}
  });

  charts.distribution=new Chart(document.getElementById("distributionChart"),{
    type:"doughnut",
    data:{labels:distributionLabels,datasets:[{
      data:distributionValues,
      backgroundColor:["#4263eb","#17a879","#8b70df","#f3a44d","#e56d87","#55b9c9","#8895a9"]
    }]},
    options:{...common,cutout:"65%"}
  });

  charts.company=new Chart(document.getElementById("companyChart"),{
    type:"bar",
    data:{labels:companyLabels,datasets:[{
      label:"Customers",
      data:companyValues,
      backgroundColor:"#6582ef",
      borderRadius:5
    }]},
    options:{...common,indexAxis:"y",scales:{x:{beginAtZero:true,ticks:{precision:0}}}}
  });

  charts.performance=new Chart(document.getElementById("performanceChart"),{
    type:"bar",
    data:{labels,datasets:[{
      label:"Monthly Records",
      data:growth,
      backgroundColor:"#17a879",
      borderRadius:5
    }]},
    options:{...common,scales:{y:{beginAtZero:true,ticks:{precision:0}}}}
  });

  renderReport();
}

// ==========================================
// BUSINESS REPORT GENERATOR
// ==========================================

function buildReport(){
  const d=analyticsData();
  const c=d.customers;
  const companies=d.entries.length;
  const recent=c.filter(x=>(Date.now()-new Date(x.createdAt).getTime())/(86400000)<=30).length;
  const top=d.entries[0];
  const latest=c.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];

  return {
    total:c.length,
    companies,
    recent,
    top,
    latest,
    monthly:d.months,
    insights:[
      c.length===0
        ?"Your CRM database is currently empty. Add customer records to start receiving meaningful analytics."
        :`Your CRM currently contains ${c.length} customer records across ${companies} company or individual categories.`,
      recent>0
        ?`${recent} customer records were added in the last 30 days. Continue monitoring customer acquisition.`
        :"No new customer records have been added in the last 30 days. Consider improving your customer acquisition activities.",
      top
        ?`${top[0]} is your largest customer category with ${top[1]} records.`
        :"Company distribution will be available when you add records.",
      latest
        ?`Your most recently added customer is ${latest.name}.`
        :"Your latest customer information will appear here."
    ]
  };
}

function reportHTML(){
  const r=buildReport();
  return `
    <div class="report-row"><b>Total Customer Records</b><span>${r.total}</span></div>
    <div class="report-row"><b>Unique Categories</b><span>${r.companies}</span></div>
    <div class="report-row"><b>Added in Last 30 Days</b><span>${r.recent}</span></div>
    ${r.insights.map((x,i)=>`<div class="report-highlight"><b>Insight ${i+1}:</b> ${escapeHTML(x)}</div>`).join("")}
    <div class="report-highlight"><b>Recommendation:</b> Maintain updated customer details, review your customer growth regularly and follow up with customers to improve engagement.</div>
  `;
}

function renderReport(){
  const html=reportHTML();
  document.getElementById("reportContent").innerHTML=html;
  document.getElementById("fullReport").innerHTML=html;
}

function downloadReport(){
  if(currentUser.role!=="consumer")return;

  const r=buildReport();
  const lines=[
    "INTELLI CRM - BUSINESS ANALYTICS REPORT",
    "Account: "+currentUser.name,
    "Generated: "+new Date().toLocaleString(),
    "",
    "TOTAL CUSTOMERS: "+r.total,
    "UNIQUE CATEGORIES: "+r.companies,
    "CUSTOMERS ADDED IN LAST 30 DAYS: "+r.recent,
    "",
    "BUSINESS INSIGHTS:",
    ...r.insights.map((x,i)=>(i+1)+". "+x),
    "",
    "RECOMMENDATION:",
    "Maintain updated customer records and regularly review customer growth."
  ];

  const blob=new Blob([lines.join("\n")],{type:"text/plain"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="IntelliCRM-Business-Report.txt";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Business report downloaded!");
}

// ==========================================
// AI ASSISTANT - RULE-BASED DEMO
// ==========================================

function renderQuickInsights(){
  const r=buildReport();
  const items=[
    ["Customer Database",`You have ${r.total} customer records in your CRM.`],
    ["Recent Activity",`${r.recent} records added in the last 30 days.`],
    ["Business Categories",`${r.companies} unique company or individual categories.`],
    ["Business Tip","Follow up with customers regularly to build stronger relationships."]
  ];

  document.getElementById("quickInsights").innerHTML=items.map(x=>`
    <div class="insight-card"><b>${x[0]}</b><p>${escapeHTML(x[1])}</p></div>
  `).join("");
}

function askAI(question){
  const input=document.getElementById("chatInput");
  input.value=question;
  document.getElementById("chatForm").requestSubmit();
}

document.getElementById("chatForm").addEventListener("submit",e=>{
  e.preventDefault();

  const input=document.getElementById("chatInput");
  const question=input.value.trim();
  if(!question)return;

  addMessage("user",question);
  input.value="";

  const answer=generateAIAnswer(question);
  setTimeout(()=>addMessage("bot",answer),350);
});

function addMessage(type,message){
  const box=document.getElementById("chatMessages");
  const div=document.createElement("div");
  div.className="message "+type;

  if(type==="bot"){
    const title=document.createElement("b");
    title.textContent="Intelli AI ✦";
    const content=document.createElement("p");
    content.textContent=message;
    div.append(title,content);
  }else{
    const content=document.createElement("p");
    content.textContent=message;
    div.append(content);
  }

  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

function generateAIAnswer(question){
  const q=question.toLowerCase();
  const r=buildReport();

  if(q.includes("revenue")||q.includes("sales")||q.includes("income")||q.includes("earning")){
    return "Your current CRM database contains "+r.total+" customer records. Actual sales and revenue figures are not yet connected to this frontend. Once we add sales and transaction records in the backend, I can help analyze revenue, sales trends and performance.";
  }

  if(q.includes("growth")||q.includes("trend")||q.includes("month")){
    return "CUSTOMER GROWTH ANALYSIS\n\nTotal customers: "+r.total+"\nAdded in last 30 days: "+r.recent+"\n\nReview your monthly growth graph in Business Analytics. Consistent customer acquisition and follow-ups can support business growth.";
  }

  if(q.includes("company")||q.includes("category")||q.includes("distribution")){
    return "CUSTOMER DISTRIBUTION\n\nUnique categories: "+r.companies+"\n"+(r.top?"Largest category: "+r.top[0]+" ("+r.top[1]+" records).":"No company categories available yet.")+"\n\nCheck your Customer Distribution chart for more details.";
  }

  if(q.includes("suggest")||q.includes("improve")||q.includes("recommend")||q.includes("advice")){
    return "BUSINESS IMPROVEMENT SUGGESTIONS\n\n1. Keep customer contact details updated.\n2. Follow up with customers regularly.\n3. Add company information to understand customer distribution.\n4. Review monthly customer growth.\n5. Identify inactive customers and reconnect with them.\n\nThese suggestions are based on your current CRM records.";
  }

  if(q.includes("total")||q.includes("how many")||q.includes("customer count")){
    return "CUSTOMER DATABASE SUMMARY\n\nTotal customers: "+r.total+"\nUnique categories: "+r.companies+"\nAdded in last 30 days: "+r.recent+"\n\nYou can view individual records in the Customer Management section.";
  }

  if(q.includes("overview")||q.includes("performance")||q.includes("business")){
    return "YOUR BUSINESS OVERVIEW\n\nTotal customer records: "+r.total+"\nBusiness categories: "+r.companies+"\nRecent additions: "+r.recent+"\n\n"+r.insights.join("\n\n")+"\n\nOpen Business Analytics to see the graphical reports.";
  }

  if(q.includes("report")){
    return "Your business report is ready in the Reports section. It includes customer totals, business categories, recent activity and data-based recommendations. You can also download the report as a text file.";
  }

  return "I can help you analyze your CRM data. Try asking me:\n\n• Give me my business overview.\n• How many customers do I have?\n• Analyze my customer growth.\n• Show my company distribution.\n• Give me business improvement suggestions.\n\nFor now, I use your saved customer records and predefined analysis rules. Live AI intelligence will be connected through the backend.";
}

// ==========================================
// SELLER AND SUBSCRIPTIONS
// ==========================================

function renderSeller(){
  const consumers=getUsers().filter(u=>u.role==="consumer");

  document.getElementById("sellerStats").innerHTML=`
    ${stat("Total Consumers",consumers.length,"Registered accounts","♙")}
    ${stat("Basic Plans",consumers.filter(u=>u.plan==="Basic").length,"Subscriptions","◇")}
    ${stat("Intermediate Plans",consumers.filter(u=>u.plan==="Intermediate").length,"Subscriptions","◇")}
    ${stat("Advanced Plans",consumers.filter(u=>u.plan==="Advanced").length,"Subscriptions","◇")}
  `;

  document.getElementById("consumerTable").innerHTML=consumers.length
    ?consumers.map(u=>`
      <tr><td><strong>${escapeHTML(u.name)}</strong></td><td>${escapeHTML(u.username)}</td><td>${escapeHTML(u.email)}</td><td>${escapeHTML(u.plan)}</td><td>${getCustomers().filter(c=>c.ownerId===u.id).length}</td></tr>
    `).join("")
    :'<tr><td colspan="5">No consumers registered yet.</td></tr>';
}

function renderPlans(){
  const html=plans.map((p,i)=>`
    <div class="plan-card ${i===1?"featured":""}">
      ${i===1?'<span class="ai-tag">POPULAR PLAN</span>':""}
      <h3>${p.name}</h3>
      <div class="plan-price">₹${p.price}<small>/ month</small></div>
      <p>${p.desc}</p>
      <ul>${p.features.map(f=>`<li>${f}</li>`).join("")}</ul>
      <button class="btn ${i===1?"primary":"outline"}" onclick="selectPlan('${p.name}')">${currentUser.plan===p.name?"Current Plan":"Select Plan"}</button>
    </div>
  `).join("");

  document.getElementById("plansContent").innerHTML=html;
  document.getElementById("sellerPlans").innerHTML=html;
}

function selectPlan(name){
  if(!confirm("Select "+name+" plan? This demo does not take payment."))return;

  const users=getUsers().map(u=>u.id===currentUser.id?{...u,plan:name}:u);
  saveUsers(users);
  currentUser=users.find(u=>u.id===currentUser.id);
  sessionStorage.setItem("intelli_session",JSON.stringify(currentUser));
  renderPlans();
  renderProfile();
  showToast(name+" plan selected!");
}

// ==========================================
// PROFILE, SETTINGS AND LOGOUT
// ==========================================

function renderProfile(){
  const first=currentUser.name.charAt(0).toUpperCase();
  document.getElementById("profileAvatar").textContent=first;
  document.getElementById("profileName").textContent=currentUser.name;
  document.getElementById("profileRole").textContent=currentUser.role.toUpperCase();

  const date=new Date(currentUser.createdAt).toLocaleDateString();

  document.getElementById("profileDetails").innerHTML=`
    <div><b>Full Name</b><span>${escapeHTML(currentUser.name)}</span></div>
    <div><b>Username</b><span>${escapeHTML(currentUser.username)}</span></div>
    <div><b>Email</b><span>${escapeHTML(currentUser.email)}</span></div>
    <div><b>Account Type</b><span>${escapeHTML(currentUser.role)}</span></div>
    <div><b>Subscription</b><span>${escapeHTML(currentUser.plan)}</span></div>
    <div><b>Joined</b><span>${date}</span></div>
  `;

  document.getElementById("settingRole").textContent=currentUser.role;
  document.getElementById("settingUsername").textContent=currentUser.username;
}

function logout(){
  if(!confirm("Are you sure you want to logout?"))return;
  currentUser=null;
  sessionStorage.removeItem("intelli_session");
  destroyCharts();
  showPage("homePage");
  showToast("Logged out successfully!");
}

// ==========================================
// UTILITIES
// ==========================================

function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);
}

function showToast(message){
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}

// ==========================================
// APPLICATION START
// ==========================================

if (currentUser && authToken) {
  loadDashboard();
  showPage("dashboardPage");
} else {
  currentUser = null;
  authToken = "";

  sessionStorage.removeItem("intelli_session");
  sessionStorage.removeItem("intelli_token");

  showPage("homePage");
}
