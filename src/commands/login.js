const BaseSlashCommand = require('../utils/BaseSlashCommand.js');
const { SlashCommandBuilder } = require('discord.js');
const StudentVue = require('studentvue/lib/StudentVue/StudentVue.js');
const { Users } = require('../models/database.js');

module.exports = class LoginSlashCommand extends BaseSlashCommand {
    constructor() {
      super('login');
    }

    async run(client, interaction) {
        const username = interaction.options.getString("username");
        const password = interaction.options.getString("password");
        const domain = interaction.options.getString("domain");

        // Check if the student is valid
        const student = await StudentVue.login(domain, { username: username, password: password });
        if (!student) return await interaction.reply({ content: 'Invalid StudentVUE credentials.' });
    
        try {
            const user = await Users.create({
                discordId: interaction.user.id,
                username: username,
                password: password,
                domain: domain
            });
            console.log(user.toJSON());
            return await interaction.reply({ content: `Successfully logged in as ${user.username}.`, ephemeral: true});
		}
		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.reply('That student already exists.');
			}
			return interaction.reply('Something went wrong with adding a student.');
		}
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Login to StudentVUE. (Don't end domain with a / or use quotes")
            .addStringOption((option) =>
                option.setName("username")
                    .setDescription('StudentVUE Username')
                    .setRequired(true))
            .addStringOption((option) =>
                option.setName("password")
                    .setDescription('StudentVUE Password')
                    .setRequired(true))
            .addStringOption((option) =>
                option.setName("domain")
                    .setDescription('StudentVUE District Domain')
                    .setRequired(true))
            .toJSON();
      }
}