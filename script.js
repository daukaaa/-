const accounts = [
  {
    owner: 'Dauren',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.1,
    pin: 1111,
  },
  {
    owner: 'Alihan',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  },
  {
    owner: 'Almas4568',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
  },
];

// работа с элементами DOM
const loginUsername = document.querySelector('#login-username');
const loginPin = document.querySelector('#login-pin');
const loginForm = document.querySelector('#login-form');
const app = document.querySelector('#app');
const balanceLabel = document.querySelector('.balance-amount');
const containerMovements = document.querySelector('.transaction-section');
const summaryIn = document.querySelector('.summary-in');
const summaryOut = document.querySelector('.summary-out');
const summaryInterest = document.querySelector('.summary-interest');
const btnSort = document.querySelector('.btn-sort');
const logoutTimerLabel = document.querySelector('.timer');

let currentAccount;
let timer;

// создаем функцию для обновления
const update = function (acc) {
  displayMovements(acc.movements);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};
let sorted = false; // переменная состояния сортировки

// перевод денег
document.querySelector('.transfer').addEventListener('click', function () {
  const amount = Number(document.getElementById('transfer-amount').value);
  const receiverAcc = accounts.find(acc => acc.owner === document.getElementById('transfer-to').value);
  
  if (amount > 0 && receiverAcc && currentAccount.balance >= amount) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Обновление интерфейса
    update(currentAccount);
  }
});

// займ
document.querySelector('.loan').addEventListener('click', function () {
  const amount = Number(document.getElementById('loan-amount').value);
  
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    
    // Обновление интерфейса
    update(currentAccount);
  }
});

// удаляем аккаунт
document.querySelector('.close').addEventListener('click', function () {
  if (currentAccount.owner === document.getElementById('close-username').value &&
      currentAccount.pin === Number(document.getElementById('close-pin').value)) {
    const index = accounts.findIndex(acc => acc.owner === currentAccount.owner);
    accounts.splice(index, 1);
    
    // Скрыть интерфейс и показать форму входа
    app.classList.add('hidden');
    loginForm.classList.remove('hidden');
  }
});

// сортировка транзакции
document.querySelector('.btn-sort').addEventListener('click', function () {
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="transaction transaction-${type}">${mov > 0 ? '+' : ''}${mov}€</div>
    `;
    containerMovements.insertAdjacentHTML('beforeend', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  balanceLabel.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((sum, mov) => sum + mov, 0);
  summaryIn.textContent = `${incomes}€`;

  const outgoings = acc.movements
    .filter(mov => mov < 0)
    .reduce((sum, mov) => sum + mov, 0);
  summaryOut.textContent = `${Math.abs(outgoings)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((sum, int) => sum + int, 0);
  summaryInterest.textContent = `${interest}€`;
};

const startLogoutTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    logoutTimerLabel.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      app.classList.add('hidden');
      loginForm.classList.remove('hidden');
    }

    time--;
  };

  // 5 минут таймер выхода
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

btnSort.addEventListener('click', function () {
  displayMovements(currentAccount.movements, !sorted);
});

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.owner === loginUsername.value
  );

  if (currentAccount?.pin === Number(loginPin.value)) {
    app.classList.remove('hidden');
    loginForm.classList.add('hidden');

    update(currentAccount);
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }
});