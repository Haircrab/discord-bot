import { ApplicationCommandOptionType } from 'discord.js';
import { useQueue } from 'discord-player';
import { isInVoiceChannel } from '../utils/voicechannel';

export const name = 'volume';
export const description = 'Change the volume!';
export const options = [
  {
    name: 'volume',
    type: ApplicationCommandOptionType.Integer,
    description: 'Number between 0-200',
    required: true,
  },
];
export async function execute(interaction) {
  const { default: Conf } = await import('conf');

  await interaction.deferReply();

  let volume = interaction.options.getInteger('volume');
  volume = Math.max(0, volume);
  volume = Math.min(200, volume);

  // Set the general volume (persisted)
  const config = new Conf({ projectName: 'volume' });
  config.set('volume', volume);

  // Set the volume of the current queue
  const queue = useQueue(interaction.guild.id);
  const inVoiceChannel = isInVoiceChannel(interaction);
  if (inVoiceChannel && queue && queue.currentTrack) queue.node.setVolume(volume);

  return void interaction.followUp({
    content: `🔊 | Volume set to ${volume}!`,
  });
}
