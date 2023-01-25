const BaseSlashCommand = require('../utils/BaseSlashCommand.js');
const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../models/database.js');

module.exports = class LogoutSlashCommand extends BaseSlashCommand {
    constructor() {
        super('logout');
    }

    async run(client, interaction) {
        try {
            // Check that it was confirmed
            if (!interaction.options.getBoolean('confirm')) return await interaction.reply({ content: 'You must confirm you want to logout.', ephemeral: true });
            // Remove User from database
            await Users.destroy({
                where: {
                    discordId: interaction.user.id,
                }
            });
        } catch (error) {
            console.error(error);
            return await interaction.reply({ content: 'Something went wrong while logging out.', ephemeral: true });
        }

        return await interaction.reply({ content: 'Successfully logged out!', ephemeral: true });
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Logout of StudentVUE (Remove your account from the database)")
            .addBooleanOption(option => 
                option.setName('confirm')
                .setDescription('Confirm you want to logout')
                .setRequired(true))
            .toJSON();
    }
}