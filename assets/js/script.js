'use strict';

// BANKIST APP

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const updateUi = (accounts) => {
  // Display Summary
  calcDisplaySummary(accounts);
  // Display Balance
  userTotalBalance(accounts);
  // Display Movements
  displayMovements(accounts);
}

// Formatting the date using API.
// const now = new Date();
// labelDate.textContent = new Intl.DateTimeFormat('pt-PT').format(now);

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const mov = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;
  mov.forEach(function (mov, i) {
    const typeOfPayment = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      sec: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    }
    const displayDates = new Intl.DateTimeFormat('en-US', options).format(date);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${typeOfPayment}"> ${i + 1, typeOfPayment}</div>
        <div class="movements__date">${displayDates}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

const createUsername = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
}
createUsername(accounts);

const userTotalBalance = function (accounts) {
  accounts.balance = accounts.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${accounts.balance.toFixed(2)}€`
};

const calcDisplaySummary = function (accounts) {
  const income = accounts.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${income.toFixed(2)}€`;

  const outIncome = accounts.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outIncome.toFixed(2))}€`

  const interest = accounts.movements
    .filter(dep => dep > 0)
    .map(dep => (dep * accounts.interestRate) / 100)
    .filter((int, index, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

let currentUser, timer;
// currentUser = account1;
// containerApp.style.opacity = 100;
// updateUi(currentUser);

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentUser?.pin === +(inputLoginPin.value)) {
    // Clear the input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Create current Date and Time.
    const date = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      sec: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    }
    const local = navigator.language;
    labelDate.textContent = Intl.DateTimeFormat(local, options).format(date);
    // check timer exit or not.
    if (timer) clearInterval(timer);
    // Start timer.
    timer = startTimer();
    console.log(timer);

    // Display UI and Message
    labelWelcome.textContent = `Welcome back, ${currentUser.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    updateUi(currentUser);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  inputTransferAmount.value = inputTransferTo.value = '';
  if (amount > 0 &&
    receiverAcc &&
    currentUser.balance >= amount &&
    receiverAcc.username !== currentUser.username) {
    // Add Current date and time.
    currentUser.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Doing the Transfer
    currentUser.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUi(currentUser);
    // Reset Timer.
    clearInterval(timer);
    timer = startTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentUser.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add Loan Date.
      currentUser.movementsDates.push(new Date().toISOString());
      // Add Amount to the account.
      currentUser.movements.push(amount);
      updateUi(currentUser);
      // Reset Timer.
      clearInterval(timer);
      timer = startTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (inputCloseUsername.value === currentUser.username &&
    +(inputClosePin.value) === currentUser.pin
  ) {
    const index = accounts.findIndex(acc => acc.username === currentUser.username);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentUser, !sorted);
  console.log(!sorted);
  sorted = !sorted;
  // Reset Timer.
  clearInterval(timer);
  timer = startTimer();
});

labelBalance.addEventListener('click', function () {
  const movement = Array.from(
    document.querySelectorAll('.movements__value'),
    el => el.textContent.replace('€', '$')
  );
  // Reset Timer.
  clearInterval(timer);
  timer = startTimer();
  const movement2 = [...document.querySelectorAll('.movements__value')];
})

// Function to start timer
const startTimer = function () {
  // Set time to 1 min
  let time = 60 * 5;

  function updateTimer() {
    const minute = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    if (time > 0) {
      labelTimer.textContent = `${minute}:${sec}`;
      time--; // Decrease remaining time by 1 second
    } else {
      clearInterval(timer); // Stop the timer when time is up
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    }
  }
  //  Update time on UI
  updateTimer();
  const timer = setInterval(updateTimer, 1000);
  return timer;
};
