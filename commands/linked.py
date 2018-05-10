from commands.base_command  import BaseCommand
import requests
import settings
from utils                  import get_base_url, get_emoji

class Linked(BaseCommand):
    def __init__(self):
        description = "Check if your account is linked to a forum profile"
        params = []
        super().__init__(description, params)

    async def handle(self, params, message, client):
        url = get_base_url() + 'linked.php'
        data = {
            'discord_id': message.author.id,
        }
        r = requests.post(url, data)
        
        if r.text == 'success':
            msg = 'No worries! Your Discord Account is already linked to your Forum Profile.'
        else:
            msg = 'Sorry! Your Discord Account is not yet linked to your Forum Profile. Use `' + settings.COMMAND_PREFIX + 'link <forum_username>` to get started.'
        
        await client.send_message(message.channel, msg)

