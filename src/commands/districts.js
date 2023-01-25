const BaseSlashCommand = require('../utils/BaseSlashCommand.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StudentVue = require('studentvue/lib/StudentVue/StudentVue.js');

module.exports = class DistrictsSlashCommand extends BaseSlashCommand {
    constructor() {
      super('districts');
    }
  
    async run(client, interaction) {
        // Get the districts near the provided zipcode
        const districtsNearZip = await StudentVue.findDistricts(interaction.options.getString("zipcode"));
        // Build the embed
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setThumbnail('https://freesvg.org/img/robot-head.png')
            .setTitle("Districts Near " + interaction.options.getString("zipcode"))
            .setDescription("Here are the closest districts to the provided zipcode: ")
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: ""});
           
        // Add the districts to the embed
        for (let i = 0; i < districtsNearZip.length; i++) {
            embed.addFields({
                name: JSON.stringify(districtsNearZip[i].name).replaceAll('"', ''),
                value: "\nAddress: " + JSON.stringify(districtsNearZip[i].address).replaceAll('"', '')
                + "\nURL: " + JSON.stringify(districtsNearZip[i].parentVueUrl).replaceAll('"', '') + "\n\n"
            });
        }
        return await interaction.reply({ embeds: [embed] });
    }
  
    getSlashCommandJSON() {
      return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Gets a list of districts closest to provided zipcode.')
        .addStringOption((option) =>
            option.setName("zipcode")
                .setDescription('Zipcode used to look for closest districts')
                .setRequired(true))
        .toJSON();
    }
};