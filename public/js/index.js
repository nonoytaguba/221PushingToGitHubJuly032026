console.log("Hello from parcel!"); 
import '@babel/polyfill'; // npm i @babel/polyfill
import {login, logout} from './login';
import {updateSettings} from './updateSettings'; //Lesson 196
import {bookTour} from './stripe';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour');

//DELEGATION
if(mapBox){
  const locations = JSON.parse(mapBox.dataset.location);
  console.log('locations', locations);
}

if(loginForm)
  loginForm.addEventListener('submit', e => {     //Lesson 189
    e.preventDefault();  // Stops a <form> from reloading the entire page when the submit button is clicked.
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  })

  if(logOutBtn) logOutBtn.addEventListener('click', logout)
  
  if(userDataForm)
     userDataForm.addEventListener('submit', e => {     //Lesson 196
      e.preventDefault();  // Stops a <form> from reloading the entire page when the submit button is clicked.
      const form = new FormData(); //Lesson 203
      form.append('name', document.getElementById('name').value); //Lesson 203
      form.append('email', document.getElementById('email').value); //Lesson 203
      form.append('photo', document.getElementById('photo').files[0]); //Lesson 203
      // console.log('form>>>>', form)
      // const email = document.getElementById('email').value;
      // const name = document.getElementById('name').value;
      // updateSettings({email, name}, 'data');
      updateSettings(form, 'data'); //Lesson 203
    })

if(userPasswordForm)
     userPasswordForm.addEventListener('submit', async e => {     //Lesson 196
      e.preventDefault();  // Stops a <form> from reloading the entire page when the submit button is clicked.
       document.querySelector('.btn--save-password').textContent = 'Updating..........'
      
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      
      await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

      document.querySelector('.btn--save-password').textContent = 'Save password'
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    })

if (bookBtn)
    bookBtn.addEventListener('click', e=> {
        e.target.textContent = 'Processing . . . . '
        // const tourId = e.target.dataset.tourId;
        const {tourId} = e.target.dataset;  // or const tourId = e.target.dataset.tourId;
        bookTour(tourId)
    })