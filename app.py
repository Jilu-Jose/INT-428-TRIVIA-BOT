from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os


genai.configure(api_key="AIzaSyDiqv9kfsh5DEAz_t3nYCqpmEc6yTdOOsc")


try:
    print("Initializing Gemini-2.0 model...")
    model = genai.GenerativeModel("gemini-1.5-pro")  
    print("Model initialization successful!")
except Exception as e:
    print(f"Error initializing model: {str(e)}")
    raise e

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json["message"]
    try:
        response = model.generate_content(user_input)
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"Error in chat route: {str(e)}")
        return jsonify({"reply": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
