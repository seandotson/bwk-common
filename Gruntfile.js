module.exports = function(grunt){


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    typescript: {
      build_node: {
        src: ['src/_index-node.ts'],
        dest: 'dist/bwk-common-node.js',
        options: {
          module: 'commonjs'//, //or amd
        }
      }
    }

  });



  grunt.loadNpmTasks('grunt-typescript');

  grunt.registerTask('build', ['typescript:build_node']);

}
