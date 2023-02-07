import BaseSlashCommand from '../utils/BaseSlashCommand.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default class HelpSlashCommand extends BaseSlashCommand {
    constructor() {
      super('help');
    }

    async run(client, interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('All about Grade-Bot!')
            .setDescription('Grade-Bot is a Discord bot that allows you to use StudentVUE within Discord.')
            .setThumbnail('https://freesvg.org/img/robot-head.png')
            .addFields(
                { name: '/districts', value: 'Get a list of all supported districts near the provided zipcode.' },
                { name: '/login or /logout', value: 'Login & Logout of StudentVUE.' },
                { name: '/studentinfo', value: 'Get Student Information.' },
                { name: '/schedule', value: 'Get Student Schedule.'},
                { name: '/gradebook', value: 'Get Student Grades.' },
                { name: 'GitHub', value: 'https://github.com/thereal-cc/Grade-Bot'})
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: '' });

        return await interaction.reply({ embeds: [helpEmbed] });
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Learn about what GradeBot can do!")
            .toJSON();
    }
}