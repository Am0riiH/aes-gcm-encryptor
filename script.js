function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

const demoKeyString = "OmarRashiedSecurityDemoKey123456"; 

async function getFixedKey() {
  const enc = new TextEncoder();
  const raw = enc.encode(demoKeyString).slice(0, 32); 
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptAES(plaintext) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getFixedKey();
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), iv.byteLength);
  return arrayBufferToBase64(combined.buffer);
}

async function decryptAES(base64Combined) {
  const all = new Uint8Array(base64ToArrayBuffer(base64Combined));
  const iv = all.slice(0, 12);
  const cipher = all.slice(12);
  const key = await getFixedKey();
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plainBuffer);
}

async function doEncrypt() {
  const plain = document.getElementById("plain").value;
  const out = document.getElementById("cipherOut");
  const status = document.getElementById("status");
  out.value = ""; status.textContent = "";

  if (!plain) {
    status.textContent = "Please enter text to encrypt.";
    status.className = "status error";
    return;
  }

  try {
    const cipher = await encryptAES(plain);
    out.value = cipher;
    status.textContent = "Encrypted successfully.";
    status.className = "status success";
  } catch (e) {
    console.error(e);
    status.textContent = "Encryption failed.";
    status.className = "status error";
  }
}

async function doDecrypt() {
  const cipher = document.getElementById("cipherIn").value.trim();
  const out = document.getElementById("plainOut");
  const status = document.getElementById("status");
  out.value = ""; status.textContent = "";

  if (!cipher) {
    status.textContent = "Please paste encrypted text.";
    status.className = "status error";
    return;
  }

  try {
    const plain = await decryptAES(cipher);
    out.value = plain;
    status.textContent = "Decrypted successfully.";
    status.className = "status success";
  } catch (e) {
    status.textContent = "Decryption failed.";
    status.className = "status error";
  }
}

function hookCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy");
      const ta = document.getElementById(targetId);
      const text = ta.value || "";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text);
        } else {
          ta.select();
          document.execCommand("copy");
          ta.blur();
        }
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 900);
      } catch {
        btn.textContent = "Failed";
        setTimeout(() => (btn.textContent = "Copy"), 900);
      }
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("encryptBtn").addEventListener("click", doEncrypt);
  document.getElementById("decryptBtn").addEventListener("click", doDecrypt);
  hookCopyButtons();
});
//--Omar Rashied--