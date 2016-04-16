module.exports = function(grunt){
    var js = {
        core:[
            'src/core.js',
            'src/cell.js',
            'src/element.js',
            'src/link.js',
            'src/graph.js',
            'src/vectorizer.js',
            'src/shape/shape.basic.js',
            'src/connectors/connectors.normal.js'
        ],
        plugins:{
            'shape.devs':['src/shape/shape.devs.js'],
            'shape.node':['src/shape/shape.node.js'],
            'shape.simple':['src/shape/shape.simple.js'],
            'shape.uml.state':['src/shape/shape.uml.state']
        }
    }

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
        },
        concat:{
            dist:{
                src:js.core,
                dest:'dist/joint_chart.js'
            }
        },
        uglify:{
            build:{
                src:'dist/joint_chart.js',
                dest:'dist/joint_chart.min.js'
            }
        }
    });



    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('default', ['sass','concat','uglify']);
    grunt.registerTask('build', ['concat']);
};
