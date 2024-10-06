import React, { useContext , useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';
import  { useRazorpay } from 'react-razorpay';
// import { useEffect } from 'react';
// import {useNavigate} from 'react'


function PlaceOrder() {
  const {getTotalCartAmount,token,food_list,cartItems,url} =useContext(StoreContext);
  const [razorpay,setRazorpay]= useState({
    orderID:"",
    amouot:0,
    currency:"",
})

const {Razorpay}= useRazorpay();

const [isRazorpayOpen,setIsRazorpayOpen] =useState(false);


  const [data,setData] =useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:"",   
  })

  const onChangeHandler =(event)=>{
    const name = event.target.name;
    const value =event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const placeOdrer =async (event)=>{
    event.preventDefault();
    let orderItems =[];
    food_list.map((item)=>{
    if (cartItems[item._id]>0) {
      let itemInfo = item;
      itemInfo["quantity"]=cartItems[item._id];
      orderItems.push(itemInfo)

    }  
    })
    let orderData ={
      address:data,
      items:orderItems,
      amount :getTotalCartAmount()+2,
    }
    let response =await axios.post(url+"/api/order/place",orderData,{headers:{token}})
    if(response.data.success){
      const {session_url} =response.data;
      window.location.replace(session_url);
    }
    else{
      alert("Error")
    }
  }

  const razorpayOpen = async(e)=>{
    e.preventDefault();  
    try {
      const response =await axios.post("https://food-delivery-backend-9x1d.onrender.com/order",{amount:getTotalCartAmount()*100})
      if (response.data.order_id) {
        setRazorpay({
          orderID:response.data.order_id,
          amount:response.data.amount,
          currency:response.data.currency

        })
        const options = {
          key: "rzp_test_nVAGLWdI0YbQyg", // Enter the Key ID from your Razorpay Dashboard
          amount: response.data.amount, // Amount is in paise, e.g., 50000 paise = 500 INR
          currency: response.data.currency,
          order_id: response.data.order_id, // Order ID from the backend
          name: "Vishal Consultancy Pvt.Ltd",
          description: "Test Transaction",
          handler:async (response)=>{
            placeOdrer();        
          },
          image: "https://yourcompany.com/logo.png", // Optional company logo URL
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999",
          },
          notes: {
            address: "Your Company Address",
          },
          theme: {
            color: "#3399cc",
          },
        };
        setIsRazorpayOpen(true);
        const rzp = new Razorpay(options)
        rzp.open();
        
      }

    } catch (error) {
      console.log(error);   
    }
  }
  // const navigate = useNavigate();

// useEffect(() => {
// if (!token) {
//   navigate("/cart");
// }
// else if(getTotalCartAmount()===0){
// navigate("/cart")
// }
// }, [token])


  return (
    <><form onSubmit={razorpayOpen}  className='place-order'>
    <div className='place-order-left'>
      <p className='title'>Delivery Information</p>
      <div className='multi-fields'>
           <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type='text'placeholder='First name' ></input>
           <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type='text'placeholder='Last name' ></input>
      </div>
      <input required name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Email address ' ></input>
      <input required name='street' onChange={onChangeHandler} value={data.street} type='text' placeholder='street' ></input>
      <div className='multi-fields'>
           <input required name='city' onChange={onChangeHandler} value={data.city} type='text'placeholder='City' ></input>
           <input required name='state' onChange={onChangeHandler} value={data.state} type='text'placeholder='State' ></input>
      </div>
      <div className='multi-fields'>
           <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type='text'placeholder='Zip code' ></input>
           <input required name='country' onChange={onChangeHandler} value={data.country} type='text'placeholder='Country' ></input>
      </div>
      <input required name='phone' onChange={onChangeHandler} value={data.phone} type='text' placeholder='phone'></input>
    </div>
    <div className='place-order-right'>
    <div className='cart-total'>
      <h2>Cart Totals</h2>
      <div>
      <div className='cart-total-details'>
        <p>Subtotal</p>
        <p>${getTotalCartAmount()}</p>
      </div>
      <hr></hr>
      <div className='cart-total-details'>
        <p>Delivery Fee </p>
        <p>${getTotalCartAmount()===0 ? 0 : 2}</p>
      </div>
      <hr></hr>
      <div className='cart-total-details'>
      <b>Total</b>
      <b>${getTotalCartAmount() ===0 ? 0:getTotalCartAmount()+2}</b>
      </div>
      </div>
      <button  type='submit'>PROCEED TO PAYMENT</button>
      </div>
    </div>
  </form> 
  </>
    
  )
}

export default PlaceOrder
