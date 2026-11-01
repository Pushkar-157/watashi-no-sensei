"""
app.py - starts the Flask server.

Run it with:   python app.py
"""

from flask import Flask
from flask_cors import CORS

import config
from routes import bp


def create_app() -> Flask:
    app = Flask(__name__)

    # Only the websites listed in CORS_ORIGINS may call the API from a browser.
    CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

    app.register_blueprint(bp)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
