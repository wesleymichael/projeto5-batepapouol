/**** VARIÁVEIS GLOBAIS ****/
let userName;
let to = 'Todos';
let type = 'message';
let usersOnline = [];

/**** Função para atualizar o nome do destinatário ****/
function messageRecipient(recipient){
    to = recipient;
}

/**** Função que remove a classe 'selecionado' do item anteriormente selecionado e adicionada ao novo item ****/
function selectUser(select){
    const user = document.querySelector('.users .selecionado');
    user.classList.remove('selecionado');

    select.classList.add('selecionado');
    
    //Atualizar o novo do remetente
    const to = document.querySelector('.users .selecionado span');
    messageRecipient(to.innerHTML);
}

function selectVisibility(select, messageType){
    const visibility = document.querySelector('.visibility .selecionado');
    visibility.classList.remove('selecionado');

    select.classList.add('selecionado');

    //Atualização da variável global que tem o tipo de mensagem selecionada (pública ou privada)
    type = messageType;
}


/**** Adicionar eventos na página ****/
function events(){
    if (document.querySelector('.login input') !== null){
        document.querySelector('.login input').addEventListener('input', validateInput);
    }

    if (document.querySelector('.login button') !== null){
        document.addEventListener("keypress", function(e) {
            if( e.key === "Enter"){
                document.querySelector('.login button').click();
            }
        });
    }

}


/**** Função para renderizar as mensagens que estão no servidor ****/
function loadMessagesSucess(sucess){
    //Implementar sucesso - carregar mensagens do servidor
    const message = sucess.data;
    let conversation = document.querySelector('.conversation');

    conversation.innerHTML = '';

    for(let i = 0; i < message.length; i++){
        if(message[i].type === 'status'){
            conversation.innerHTML += `
            <div class="msg status">
                <span class="time">(${message[i].time})</span>
                <strong class="from">${message[i].from}</strong>
                <span>${message[i].text}</span>
            </div>`;
        }
        else if(message[i].type === 'message'){
            conversation.innerHTML += `
            <div class="msg message">
                <span class="time">(${message[i].time})</span>
                <strong class="from">${message[i].from}</strong>
                <span>para</span>
                <strong class="to">${message[i].to}:</strong>
                <span>${message[i].text}</span>
            </div>`;
        }
        else if (message[i].type === 'private_message' && message[i].to === userName){
            conversation.innerHTML += `
            <div class="msg private-message">
                <span class="time">(${message[i].time})</span>
                <strong class="from">${message[i].from}</strong>
                <span>reservadamente para</span>
                <strong class="to">${message[i].to}:</strong>
                <span>${message[i].text}</span>
            </div>`;
        }
    }
    document.querySelector('.conversation div:last-child').scrollIntoView();
    //scrollIntoView    
}


/**** Função para carregar as mensagens do servidor ****/
function loadMessages(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    promise.then(loadMessagesSucess);
    //promise.catch(loadMessagesError);
}


/**** Função para mostrar a barra de navegação com informações do usuário ****/
function sidebar(){
    const aux = document.querySelector('.display-hide');
    aux.classList.remove('display-hide');
    aux.classList.add('nav');
}


/**** Função para carregar o layout da página do bate papo ****/
function loadPage(){
    const page = document.querySelector('body');
    
    page.innerHTML = `
    <header>
        <img src="../img/uol.png" alt="uol">
        <button type="text" onclick="sidebar()">
            <ion-icon name="people"></ion-icon>
        </button>
    </header>
    <div class="conversation">
    </div>
    <div class="display-hide">
        <div class="dark"></div>
        <div class="conteudo">
            <div class="info">Escolha um contato para enviar mensagem:</div>
            <ul class='users'>
                <li onclick="selectUser(this)" class='selecionado'>
                    <ion-icon name="people"></ion-icon>
                    <span>Todos</span>
                    <ion-icon name="checkmark-sharp"></ion-icon>
                </li>
                <li onclick="selectUser(this)">
                    <ion-icon name="person-circle"></ion-icon>
                    <span>Maria</span>
                    <ion-icon name="checkmark-sharp"></ion-icon>
                </li>
                <li onclick="selectUser(this)">
                    <ion-icon name="person-circle"></ion-icon>
                    <span>Pedro</span>
                    <ion-icon name="checkmark-sharp"></ion-icon>
                </li>       
            </ul>
            <div class="info">Escolha a visibilidade:</div>
            <ul class='visibility'>
                <li onclick="selectVisibility(this, 'message')" class='selecionado'>
                    <ion-icon name="lock-open"></ion-icon>
                    Público
                    <ion-icon name="checkmark-sharp"></ion-icon>
                </li>
                <li onclick="selectVisibility(this, 'private-message')">
                    <ion-icon name="lock-closed"></ion-icon>
                    Reservadamente
                    <ion-icon name="checkmark-sharp"></ion-icon>
                </li>
            </ul>
        </div>
    </div>
    <footer>
        <input type="text" placeholder="Escreva aqui...">
        <ion-icon name="paper-plane-outline"></ion-icon>
    </footer>
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
    `
}


/**** Funçao para obter a lista de participantes ativos no chat ****/
function loadUsersSucess(sucess){
    usersOnline = sucess.data;
}

function loadUsers(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(loadUsersSucess);
}


/**** Função para informar ao servidor a cada 5 segundos que o usuário permanece conectado****/
function userLogged(){
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status', {name: userName});
}


function enterChat(){

    setInterval(userLogged, 5000);
    loadUsers();
    setInterval(loadUsers, 10000);
    loadPage();
    loadMessages();
    setInterval(loadMessages, 3000);
    
}


///////////////////////////// INICIO DA IMPLEMENTAÇÃO DO CHAT (acima) ///////////////////////////////////////////////////


/**** Função para tratar resposta com sucesso ao enviar nome do usuário para o servidor ****/
function userSucessRequest(sucess){
    //Status = 200, usuário pode conectar. Ir para a página de mensagens
    //Dúvida: sempre que eu precisar do meu nome de usuário preciso usar o GET??
    //console.log(sucess.config.data);

    /*sucess.config.data é uma string no formato JSON. Preciso formatar para objeto - JSON.parse(string) */

    userName = JSON.parse(sucess.config.data).name;
    
    //Com o nome do usuário, vou entrar na sala
    enterChat();

    //window.location.href = "chat.html"
    //Redirecionar para a página de mensagens

}


/**** Função para tratar erro do envio do nome do usuário para o servidor ****/
function errorUser(erro){
    //Status 400 = nome de usuário já em uso
    //Pedir pra escolher outro nome
    if (erro.request.status === 400){
        alert('Já existe alguém com esse nome.');
        /*const login = document.querySelector('.login');
        login.innerHTML = `
            <input type="text" placeholder="Digite seu nome">
            <button type="submit" name="button" onclick="logIn()" disabled>Entrar</button>
        `;*/
        window.location.reload();
    }
    else{
        alert('Ocorreu um erro inexperado');
        window.location.reload();
        /*const login = document.querySelector('.login');
        login.innerHTML = `
            <input type="text" placeholder="Digite seu nome">
            <button type="submit" name="button" onclick="logIn()" disabled>Entrar</button>
        `;*/
    }
}


/**** Função para solicitar entrada na sala de bate papo ****/
function logIn(){
    userName = document.querySelector('input').value;
    const dados = {
        name: userName,
    };

    document.querySelector('.login').innerHTML = `
        <img class="img-loading" src="../img/loading.gif" alt="loading">
        <span>Entrando...</span>
    `;

    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', dados);

    promise.then(userSucessRequest);
    promise.catch(errorUser);
}



/**** Função para habilitar o botão quando for digitado pelo menos 3 caracteres ****/
function validateInput({target}){
    const button = document.querySelector('button');
    if(target.value.length > 2){
        button.removeAttribute('disabled');
        return;
    }
    button.setAttribute('disabled', '');
}