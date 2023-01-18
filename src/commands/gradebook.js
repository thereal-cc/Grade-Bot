const BaseSlashCommand = require('../utils/BaseSlashCommand.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StudentVue = require('studentvue/lib/StudentVue/StudentVue.js');
const { Users } = require('../models/database.js');

module.exports = class GradebookSlashCommand extends BaseSlashCommand {
    constructor() {
      super('gradebook');
    }

    async run(client, interaction) {
        // Get User from Database & Null Check
        const user = await Users.findOne({
          where: {
            discordId: interaction.user.id,
          },
        });
        if (!user) return interaction.reply({ content: 'Please login with /login before using this command.', ephemeral: true});
        
        // Login to StudentVue & Null Check
        const student = await StudentVue.login(user.domain, { username: user.username, password: user.password});
        if (!student) return await interaction.reply({ content: 'Invalid StudentVUE credentials.', ephemeral: true});

        // Defer Reply (gives user a loading state)
        await interaction.deferReply("Getting Gradebook...");

        // Get Gradebook, Marking Period
        const gradebook = await student.gradebook();
        const markingPeriod = gradebook.reportingPeriod.current.name;

        // Create Embed
        const gradebookEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Gradebook for ${user.username}`)
                .setThumbnail('https://play-lh.googleusercontent.com/43vg9yqJ6keUxcLmlhILmpAGVG5q1XTpKtkUDMiggTWvzD7j_vi8bdqRI23dWnEy7A=w480-h960')
                .setDescription('Marking Period: ' + markingPeriod)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: '' });

        // Add Each Course & Grade to Embed Fields
        for (let i = 0; i < gradebook.courses.length; i++) {
            gradebookEmbed.addFields({
                name: String(`${gradebook.courses[i].period}: ${gradebook.courses[i].title}`),
                value: String(`Overall Grade: ${gradebook.courses[i].marks[0].calculatedScore.raw} (${gradebook.courses[i].marks[0].calculatedScore.string})`)});
        }

        return await interaction.editReply({ embeds: [gradebookEmbed] });
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Gets Student's Gradebook.")
        .toJSON();
    } 
}