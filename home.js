// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAMCrFIMTBHmW2kUapiyc9d-Df7nMpRCys",
  authDomain: "myshop-login-84723.firebaseapp.com",
  projectId: "myshop-login-84723",
  storageBucket: "myshop-login-84723.firebasestorage.app",
  messagingSenderId: "728687477116",
  appId: "1:728687477116:web:4bf8e3a1defab26ff0e4f9",
  measurementId: "G-V7QHPDYPZC"
};
firebase.initializeApp(firebaseConfig);

const adminEmail = "peerapatjumpajoy@gmail.com";

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("user-email").innerText = user.email;

    if (user.email === adminEmail) {
      document.getElementById("adminBtn").style.display = "inline-block";
    }
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

const container = document.getElementById("product-list");
const filterSelect = document.getElementById("filter-category");

// ฟังชันแสดงสินค้า พร้อมรับ filter หมวดหมู่
function renderProducts(filter = "all") {
  container.innerHTML = ""; // ล้างของเดิมก่อน

  // วนลูปสินค้า
  for (let name in products) {
    const p = products[name];

    // เช็ค filter หมวดหมู่
    if (filter !== "all" && p.category !== filter) {
      continue; // ไม่ใช่หมวดนี้ข้าม
    }

    // สร้าง card สินค้า
    container.innerHTML += `
      <div class="card">
        <img src="${p.image}" alt="${name}">
        <h3>${name}</h3>
        <p>${p.detail}</p>
        <p>💸 ราคา: ${p.price} บาท</p>
        <a href="detail.html?product=${encodeURIComponent(name)}" class="btn">Detail สินค้า</a>
      </div>
    `;
  }

  // กรณีไม่มีสินค้าแสดงผล
  if (container.innerHTML.trim() === "") {
    container.innerHTML = "<p>ไม่มีสินค้าหมวดนี้</p>";
  }
}

// เรียกแสดงสินค้าครั้งแรกแบบไม่กรอง
renderProducts();

// ฟังชันเปลี่ยนกรองหมวดหมู่เมื่อเลือกใน select
filterSelect.addEventListener("change", () => {
  renderProducts(filterSelect.value);
});
