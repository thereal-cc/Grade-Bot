import BaseSlashCommand from '../utils/BaseSlashCommand.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import StudentVue from 'studentvue/lib/StudentVue/StudentVue.js';
import { Users } from '../models/database.js';

export default class GradebookSlashCommand extends BaseSlashCommand {
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
                .setDescription('Marking Period: ' + markingPeriod)
                .setThumbnail('https://freesvg.org/img/robot-head.png')
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