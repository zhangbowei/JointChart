module.exports = function(grunt){
    grunt.initConfig({
        sass:{
            dist:{
                options:{
                    style:'expanded'
                },
                files:{
                    'dist/style.css':"sass/style.scss"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.registerTask('default', ['sass']);
};
