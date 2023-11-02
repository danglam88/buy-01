def predefinedEmails = 'dang.lam@gritlab.ax'

pipeline {
    agent none // We define the specific agents within each stage

    stages {
        stage('Build') {
            agent { label 'master' } // This stage will be executed on the 'master' agent
            steps {
                script {
                    // Execute the build commands
                    sh """
                    docker rm -f \$(docker ps -aq)
                    docker rmi -f \$(docker images -aq)
                    docker volume rm \$(docker volume ls -q)
                    docker network rm \$(docker network ls -q)
                    export DOCKER_DEFAULT_PLATFORM=linux/amd64
                    docker-compose build
                    docker save -o user-microservice.tar buy-01-build-user-microservice
                    docker save -o product-microservice.tar buy-01-build-product-microservice
                    docker save -o media-microservice.tar buy-01-build-media-microservice
                    docker save -o frontend.tar buy-01-build-frontend
                    scp *.tar danglam@danglam.live:/mnt/myvolume
                    """
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
                        sh """
                        docker rm -f \$(docker ps -aq)
                        docker rmi -f \$(docker images -aq)
                        docker volume rm \$(docker volume ls -q)
                        docker network rm \$(docker network ls -q)
                        cd /mnt/myvolume
                        mv *.tar backup/
                        docker load -i user-microservice.tar
                        docker load -i product-microservice.tar
                        docker load -i media-microservice.tar
                        docker load -i frontend.tar
                        docker-compose up -d
                        """
                    } catch (Exception e) {
                        // If deploy fails, the rollback commands are executed
                        echo "Deployment failed. Executing rollback."
                        bash """
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
                        """
                        // Rethrow the exception to mark the pipeline as failed
                        throw e
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up actions, if any
            echo "The pipeline has completed execution."
        }

        failure {
            script {
                def culprits = currentBuild.rawBuild.getCulprits()*.getFullName().join(', ')
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
