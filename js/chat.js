//gohorse

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

function addMessage(text, sender="bot") {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function handleSend() {
  const text = userInput.value.trim();
  if (text === "") return;
  sendMessage(text);
  userInput.value = "";
}

function sendMessage(text) {
  addMessage(text, "user");

  let resposta = "Desculpe, ainda não sei responder isso.";
  if (/responder/i.test(text)) {
    resposta = "Posso responder perguntas sobre entregas, cadastro e serviços.";
  } else if (/entregam/i.test(text)) {
    resposta = "Entregamos em todo território nacional!";
  } else if (/cadastro/i.test(text)) {
    resposta = "Você pode se cadastrar acessando a aba 'Cadastro' no nosso site.";
  }

  setTimeout(() => addMessage(resposta, "bot"), 600);
}
