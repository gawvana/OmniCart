import pytest
import hmac
import hashlib
import time
from urllib.parse import urlencode, quote
import json

from backend.app.core.security import validate_telegram_init_data

def create_test_init_data(bot_token: str, user_data: dict, auth_date: int | None = None) -> str:
    """Create a valid Telegram initData string for testing."""
    if auth_date is None:
        auth_date = int(time.time())
    
    user_json = json.dumps(user_data, ensure_ascii=False)
    params = {
        'user': user_json,
        'auth_date': str(auth_date),
        'query_id': 'test_query_id',
    }
    
    # Create data_check_string (sorted, no hash)
    data_check_string = '\n'.join(f'{k}={v}' for k, v in sorted(params.items()))
    
    # Calculate hash
    secret_key = hmac.new(b'WebAppData', bot_token.encode(), hashlib.sha256).digest()
    hash_value = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    params['hash'] = hash_value
    return urlencode(params)

class TestTelegramAuth:
    BOT_TOKEN = 'test:token'
    USER_DATA = {'id': 123456789, 'first_name': 'Test', 'username': 'testuser'}
    
    def test_valid_init_data(self):
        init_data = create_test_init_data(self.BOT_TOKEN, self.USER_DATA)
        user = validate_telegram_init_data(init_data, self.BOT_TOKEN)
        assert user.id == 123456789
        assert user.first_name == 'Test'
    
    def test_invalid_hash(self):
        init_data = create_test_init_data(self.BOT_TOKEN, self.USER_DATA)
        # Tamper with hash
        init_data = init_data.replace(init_data.split('hash=')[1][:10], 'aaaaaaaaaa')
        with pytest.raises(Exception):
            validate_telegram_init_data(init_data, self.BOT_TOKEN)
    
    def test_expired_auth_date(self):
        old_auth_date = int(time.time()) - 7200  # 2 hours ago
        init_data = create_test_init_data(self.BOT_TOKEN, self.USER_DATA, old_auth_date)
        with pytest.raises(Exception):
            validate_telegram_init_data(init_data, self.BOT_TOKEN)
