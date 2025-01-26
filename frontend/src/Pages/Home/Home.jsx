import React, { useEffect, useState } from 'react';
import Item from './../../Components/Item/Item'; 
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);  // State to store the posts
  const [ageRange, setAgeRange] = useState(null);
  const [location, setLocation] = useState(null); // Initialize location state
  const [gender, setGender] = useState(null); 
  const [birthday, setBirthday] = useState(null); 
  const [name, setName] = useState(null); 
  const [link, setLink] = useState(null); 
  const [likes, setLikes] = useState([]); 
  const [meaningfulText, setMeaningfulText] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Function to fetch latest user posts
  const fetchLatestUserPosts = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/latest-user-posts');
      if (!response.ok) {
        throw new Error("Failed to fetch latest user posts");
      }
      const data = await response.json();
  
      // Check if latestPosts is an array before setting state
      if (Array.isArray(data.latestPosts)) {
        setPosts(data.latestPosts);
      } else {
        console.error("Expected an array but got:", data.latestPosts);
        setPosts([]); // Set to an empty array if latestPosts is not an array
      }
    } catch (error) {
      console.error("Error fetching latest user posts:", error);
    }
  };

  // Function to fetch age range
  const fetchAgeRange = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_age_range'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch age range');
      }
      const data = await response.json();
      setAgeRange(data.age_range); // Assuming the response format is { age_range: { min: 21, max: 30 } }
    } catch (error) {
      console.error("Error fetching age range:", error);
    }
  };

  // Function to fetch meaningful text and sentiment analysis
  const fetchMeaningfulTextAndSentiment = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const response = await fetch('http://localhost:4000/api/meaningful-text-and-sentiment');
      if (!response.ok) {
        throw new Error("Failed to fetch meaningful text and sentiment");
      }
      const data = await response.json();
      setMeaningfulText(data.meaningfulText);
      setSentiment(data.sentiment);
    } catch (error) {
      console.error("Error fetching meaningful text and sentiment:", error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  // Function to fetch location
  const fetchLocation = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_location'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      setLocation(data.location); // Set the location state correctly
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Function to fetch location
  const fetchGender = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_gender'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      setGender(data.gender); 
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Function to fetch location
  const fetchBirthday = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_birthday'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      setBirthday(data.birthday); 
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Function to fetch location
  const fetchName = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_name'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      setName(data.name); 
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Function to fetch location
  const fetchLink = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_link'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      setLink(data.link); 
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Function to fetch likes
  const fetchUserLikes = async () => {
    try {
      const response = await fetch('http://localhost:5000/user_likes'); // Update the URL if needed
      if (!response.ok) {
        throw new Error('Failed to fetch user likes');
      }
      const data = await response.json();
      setLikes(data.likes.data); // Update likes state with the fetched data
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  useEffect(() => {
    fetchLatestUserPosts();
    fetchMeaningfulTextAndSentiment(); 
    fetchAgeRange();
    fetchLocation();
    fetchGender();
    fetchBirthday();
    fetchName();
    fetchLink();
    fetchUserLikes();
  }, []);

  return (
    <div className="home">
      <h1>User Posts</h1>
      <hr/>
      <div className="user-posts">
        {posts.map((post, index) => (
          <div key={index} className="post-item">
            <Item id={post.post_id} image={post.image_url} />  
          </div>
        ))}
      </div>
      <h1>User Info</h1>
      <hr/>
      <div className='user-info'>
        {ageRange && <p>Age Range: {ageRange.min} - {ageRange.max}</p>}
        {location && <p>Location: {location.name}</p>} 
        {gender && <p>Gender: {gender}</p>} 
        {birthday && <p>Birthday: {birthday}</p>} 
        {name && <p>Username: {name}</p>} 
        {link && (
          <p>
          Profile Link: <a href={link} target="_blank" rel="noopener noreferrer">ClickHere</a>
          </p>
        )}
      </div>
      <h1>Liked Pages</h1>
      <hr/>
      <div className='uer-likes'>
        <ul>
          {likes.map((like, index) => (
            <li key={like.id}>{like.name}</li>
          ))}
        </ul>
      </div>
      <h1>Meaningful Text and Sentiment Analysis</h1>
      <hr/>
      <div className="meaningful-text">
      {loading ? (
          <p>Loading...</p> // Display loading message when data is loading
        ) : (
          <>
            {meaningfulText && <p><strong>Meaningful Text:</strong> {meaningfulText}</p>}
            {sentiment && (
              <div>
                <p><strong>Sentiment Score:</strong> {sentiment.score}</p>
                <p><strong>Comparative Score:</strong> {sentiment.comparative}</p>
                <p><strong>Positive Words:</strong> {sentiment.positive.join(', ')}</p>
                <p><strong>Negative Words:</strong> {sentiment.negative.join(', ')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
