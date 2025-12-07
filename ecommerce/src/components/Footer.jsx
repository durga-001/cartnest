import React from 'react'
import { assets

 } from '../assets/assets'
const Footer = () => {
  return (
    <div>
      <div className = 'flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
            <img src={assets.logo}className = 'mb-5 w-32' alt="" />
            <p className = 'w-full md:w-2/3 text-gray-600'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos accusantium harum ea repellendus ipsa dolo temporibus sint, qui vitae vel, tenetur distinctio inventore enim quisquam obcaecati facere nisi. Nam, aliquid consequatur deserunt fugiat optio natus delectus itaque molestiae eius eaque rerum voluptates eligendi. Animi temporibus iusto molestiae consectetur, amet nesciunt mollitia numquam corporis voluptatem deserunt magni!
            </p>
        </div>
         <div>
            <p className = 'text-xl font-medium mb-5'>COMPANY</p>
             <ul className = 'flex flex-col gap-1 text-gray-600'>
                <li>Home</li>
                <li>About</li>
                <li>Delivery</li>
                <li>Privacy</li>
            </ul>
        </div>

        <div>
            <p className = 'text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className = 'flex flex-col gap-1 text-gray-600'>
                <li>+12-323-323-5352</li>
                <li>foreveryou@gmail.com</li>
            </ul>
        </div>
      </div>

      <div>
        <br/>
        <p className = 'py-5 text-sm text-center'>Copyright 2025@ forever.com - All Right Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
