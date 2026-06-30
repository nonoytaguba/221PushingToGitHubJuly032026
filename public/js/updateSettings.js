import axios from 'axios';  // Lesson 191 npm i axios
import {showAlert} from './alerts';
// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {               //Lesson 196
  try{
    const url = 
    type === 'password' 
      ? '/api/v1/users/updateMyPassword'  // ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' Lesson 222
      : '/api/v1/users/updateMe' // 'http://127.0.0.1:3000/api/v1/users/updateMe' Lesson 222
    
      const res = await axios({   
        method: 'PATCH',
        url: url,
        data: data
      })
  
  if (res.data.status === 'success') {
    showAlert('success', `${type.toUpperCase()} updated successfully!`)
  }
  }catch(err){
    showAlert('error', err.response.data.message);
    // console.log(err)
    }
};
