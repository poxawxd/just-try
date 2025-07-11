// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAMCrFIMTBHmW2kUapiyc9d-Df7nMpRCys",
  authDomain: "myshop-login-84723.firebaseapp.com",
  projectId: "myshop-login-84723",
  storageBucket: "myshop-login-84723.appspot.com",
  messagingSenderId: "728687477116",
  appId: "1:728687116:web:4bf8e3a1defab26ff0e4f9",
  measurementId: "G-V7QHPDYPZC"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ดึง query string ?product=ชื่อ
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const productName = getQueryParam('product');

window.addEventListener('DOMContentLoaded', () => {
  const messageEl = document.getElementById('message');
  const form = document.getElementById('payment-form');

  auth.onAuthStateChanged(user => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      window.location.href = "index.html";
      return;
    }

    const product = products[productName];
    if (!product) {
      messageEl.innerText = "ไม่พบข้อมูลสินค้า";
      messageEl.style.color = 'red';
      return;
    }

    // ==== ส่วนลด ====
    const discountData = JSON.parse(localStorage.getItem('pendingDiscount'));
    let finalPrice = product.price;

    if (discountData && discountData.percent) {
      const discountAmount = Math.floor(product.price * discountData.percent / 100);
      finalPrice = product.price - discountAmount;
    }

    // ==== แสดงข้อมูลสินค้า ====
    const productInfoDiv = document.createElement('div');
    productInfoDiv.style.marginBottom = '15px';
    productInfoDiv.innerHTML = `
      <h3>สินค้า: ${productName}</h3>
      ${discountData ? `
        <p>ราคาเต็ม: <s>${product.price} บาท</s></p>
        <p>ส่วนลด: ${discountData.percent}%</p>
        <p><strong>ราคาที่ต้องชำระ: ${finalPrice} บาท</strong></p>
      ` : `
        <p>ราคา: <strong>${product.price} บาท</strong></p>
      `}
      <p style="color:#d9534f; font-weight:600;">
        ** โปรดตรวจสอบยอดเงินให้ครบถ้วน หากจ่ายไม่ครบ ทางร้านจะไม่คืนเงิน **
      </p>
    `;
    form.parentNode.insertBefore(productInfoDiv, form);

    // ==== ส่งคำสั่งซื้อ ====
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const transactionId = document.getElementById('transaction-id').value.trim();
      if (!transactionId) {
        messageEl.innerText = "กรุณากรอกเลขอ้างอิงการโอนเงินให้ครบถ้วน";
        messageEl.style.color = 'red';
        return;
      }

      try {
        messageEl.innerText = "กำลังส่งคำสั่งซื้อ...";
        messageEl.style.color = 'black';

        await db.collection("orders").add({
          email: user.email,
          product: productName,
          price: product.price,
          discountPercent: discountData ? discountData.percent : 0,
          finalPrice: finalPrice,
          transactionId,
          status: "pending",
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // ล้างส่วนลดหลังใช้
        localStorage.removeItem('pendingDiscount');

        messageEl.innerText = "ส่งคำสั่งซื้อสำเร็จ! กรุณารอแอดมินยืนยัน";
        messageEl.style.color = "green";

        form.reset();
        setTimeout(() => window.location.href = "home.html", 3000);

      } catch (err) {
        console.error(err);
        messageEl.innerText = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        messageEl.style.color = "red";
      }
    });
  });
});
