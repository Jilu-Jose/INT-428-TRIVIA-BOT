import google.generativeai as genai
genai.configure(api_key="AIzaSyDiqv9kfsh5DEAz_t3nYCqpmEc6yTdOOsc")

models = genai.list_models()
for m in models:
    print(m.name)
