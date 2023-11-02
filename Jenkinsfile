def predefinedEmails = 'dang.lam@gritlab.ax'

pipeline {
    agent none // We define the specific agents within each stage

    options {
        timestamps()  // Add timestamps to console output
        timeout(time: 30, unit: 'MINUTES')  // Set a timeout of 1 hour for the entire pipeline
    }

    stages {
        stage('Build') {
            agent { label 'master' } // This stage will be executed on the 'master' agent
            steps {
                script {
                    // Execute the build commands
                    sh '''
                    docker rm -f \$(docker ps -aq) || true
                    docker rmi -f \$(docker images -aq) || true
                    docker volume rm \$(docker volume ls -q) || true
                    docker network rm \$(docker network ls -q) || true
                    export DOCKER_DEFAULT_PLATFORM=linux/amd64
                    docker-compose build
                    docker save -o user-microservice.tar buy-01-pipeline-user-microservice
                    docker save -o product-microservice.tar buy-01-pipeline-product-microservice
                    docker save -o media-microservice.tar buy-01-pipeline-media-microservice
                    docker save -o frontend.tar buy-01-pipeline-frontend
                    /usr/bin/scp *.tar danglam@danglam.live:/mnt/myvolume
                    '''
                }
            }
        }
        
        stage('Deploy') {
            agent { label 'deploy' } // This stage will be executed on the 'deploy' agent
            steps {
                script {
                    // Using try-catch for the deploy and potential rollback
                    try {
                        // Execute the deploy commands
                        sh '''
                        docker rm -f \$(docker ps -aq) || true
                        docker rmi -f \$(docker images -aq) || true
                        docker volume rm \$(docker volume ls -q) || true
                        docker network rm \$(docker network ls -q) || true
                        cd /mnt/myvolume
                        if [ ! -d "/mnt/myvolume/backup" ]; then
                            mkdir -p /mnt/myvolume/backup
                        fi
                        mv *.tar backup/
                        docker load -i user-microservice.tar
                        docker load -i product-microservice.tar
                        docker load -i media-microservice.tar
                        docker load -i frontend.tar
                        docker-compose up -d
                        '''
                    } catch (Exception e) {
                        // If deploy fails, the rollback commands are executed
                        echo "Deployment failed. Executing rollback."
                        sh '''
                        docker rm -f \$(docker ps -aq)
                        docker rmi -f \$(docker images -aq)
                        docker volume rm \$(docker volume ls -q)
                        docker network rm \$(docker network ls -q)
                        cd /mnt/myvolume
                        rm -rf *.tar
                        cp backup/*.tar .
                        docker load -i user-microservice.tar
                        docker load -i product-microservice.tar
                        docker load -i media-microservice.tar
                        docker load -i frontend.tar
                        docker-compose up -d
                        '''
                        // Rethrow the exception to mark the pipeline as failed
                        throw e
                    }
                }
            }
        }
    }

    post {
        always {
            echo "The pipeline has completed execution."
        }

        success {
            script {
                sh '''
                cd /mnt/myvolume
                mv *.tar backup/
                '''
            }
        }

        failure {
            script {
                def culprits = currentBuild.rawBuild.getCulprits().collect { it.getFullName() }.join(', ')
                if (culprits) {
                    mail to: "${culprits}, ${predefinedEmails}",
                        subject: "Jenkins Build FAILURE: ${currentBuild.fullDisplayName}",
                        body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has failed.

Best regards,
Gritlab Jenkins
'''
                } else {
                    mail to: "${predefinedEmails}",
                        subject: "Jenkins Build FAILURE: ${currentBuild.fullDisplayName}",
                        body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has failed.

Best regards,
Gritlab Jenkins
'''
                }
            }
        }

        changed {
            script {
                if (currentBuild.resultIsBetterOrEqualTo('SUCCESS') && currentBuild.previousBuild.resultIsWorseOrEqualTo('FAILURE')) {
                    mail to: "${predefinedEmails}",
                         subject: "Jenkins Build RECOVERED: ${currentBuild.fullDisplayName}",
                         body: '''Hello,

The Jenkins build ${currentBuild.fullDisplayName} has recovered from failure.

Best regards,
Gritlab Jenkins
'''
                }
            }
        }
    }
}
