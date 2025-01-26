import os
import json
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Function to set up the Selenium Chrome WebDriver with headless mode
def setup_selenium():
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920x1080")
    return webdriver.Chrome(options=chrome_options)

# Function to load cookies from a JSON file and add them to the browser
def load_cookies_from_json(driver, json_path):
    if os.path.exists(json_path) and os.path.getsize(json_path) > 0:
        with open(json_path, "r") as file:
            cookies = json.load(file)
            for cookie in cookies:
                if 'sameSite' in cookie:  # Selenium does not support the 'sameSite' attribute
                    del cookie['sameSite']
                driver.add_cookie(cookie)
        print("Cookies loaded from JSON.")
    else:
        print("Cookies file not found or empty.")

# Function to fetch post IDs from your local server
def fetch_post_ids():
    try:
        response = requests.get("http://127.0.0.1:5000/user_posts")
        if response.status_code == 200:
            data = response.json()
            post_ids = [post["id"] for post in data["posts"]["data"]]
            return post_ids
        else:
            print("Failed to fetch post IDs. Status code:", response.status_code)
            return []
    except Exception as e:
        print(f"Error fetching post IDs: {e}")
        return []

# Function to take a screenshot of a Facebook post
def take_screenshot(post_url, save_path, driver):
    try:
        driver.get(post_url)
        time.sleep(5)  # Wait for the page to load
        driver.save_screenshot(save_path)
        print(f"Screenshot saved: {save_path}")
    except Exception as e:

        print(f"Failed to take screenshot for {post_url}: {e}")

# Function to upload a screenshot to the Express server
def upload_screenshot(post_id, save_path):
    try:
        files = {'screenshot': open(save_path, 'rb')}
        data = {'post_id': post_id}
        response = requests.post('http://localhost:4000/upload-screenshot', files=files, data=data)
        if response.status_code == 200:
            print(f"Screenshot uploaded: {response.json()}")
        else:
            print(f"Failed to upload screenshot. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error uploading screenshot: {e}")

# Main function
if __name__ == "__main__":
    # Path to the cookies JSON file
    cookies_path = r"C:\Users\samba\OneDrive\Desktop\Capstone-project\Capstone\flask-backend\facebook_cookies.json"
    
    # Set up Selenium WebDriver
    driver = setup_selenium()

    # Check if cookies exist, load them to avoid logging in again
    driver.get("https://www.facebook.com/")
    if os.path.exists(cookies_path):
        load_cookies_from_json(driver, cookies_path)
        driver.refresh()  # Refresh to apply cookies and log in automatically
        time.sleep(5)  # Wait to ensure login is successful
    else:
        print("Cookies file not found. Exiting.")
        driver.quit()
        exit()

    # Fetch post IDs from local server
    post_ids = fetch_post_ids()

    if post_ids:
        # Base URL for Facebook posts
        base_url = "https://www.facebook.com/"
        
        # Directory to save the screenshots
        screenshot_dir = r"C:\Users\samba\OneDrive\Desktop\Capstone-project\Capstone\flask-backend\facebook_screenshots"
        os.makedirs(screenshot_dir, exist_ok=True)  # Create directory if it doesn't exist

        # Iterate through the post IDs and take screenshots
        for post_id in post_ids:
            post_url = base_url + post_id.replace("_", "/posts/")
            save_path = os.path.join(screenshot_dir, f"{post_id}.png")
            take_screenshot(post_url, save_path, driver)
            # Upload the screenshot to the Express server
            upload_screenshot(post_id, save_path)
    else:
        print("No post IDs found.")

    # Close the WebDriver
    driver.quit()
