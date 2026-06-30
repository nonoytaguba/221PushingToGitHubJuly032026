import axios from 'axios';  // Lesson 191 npm i axios
import {showAlert} from './alerts';

export const login = async (email, password) => {               //Lesson 189
  console.log('email', email, 'password', password);
  try{
    //Here we do a request
    const res = await axios({   
    method: 'POST',
    url: 'http://127.0.0.1:3000/api/v1/users/login',
    data: {
      email: email,
      password: password
    }
  })
  if(res.data.status === 'success'){
    showAlert('success', 'Logged in successfully!')
    window.setTimeout(() => {           // let's then after one and a half seconds load the front page. So basically, the home page. Lesson 190
      location.assign('/');
    },1500)
  }
  // console.log(res);
}catch(err){
  showAlert('error', err.response.data.message);
  }
};
//*************************************************************** */
//Lesson 192 Log out

export const logout = async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        if(res.data.status = 'success') location.reload(true);
    }catch(err){
        console.log(err.response)
        showAlert('error', 'Error Log logging out! try again.')
    }
}
