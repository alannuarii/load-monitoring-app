pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'load-monitoring'
    }

    stages {
        stage('Deploy to Tahuna (Primary)') {
            steps {
                withCredentials([file(credentialsId: 'load-monitor-env', variable: 'ENV_FILE')]) {
                    sh '''
                    export DOCKER_HOST="ssh://tahuna@100.64.0.5"
                    docker stop ${DOCKER_IMAGE} || true
                    docker rm ${DOCKER_IMAGE} || true
                    docker rmi ${DOCKER_IMAGE} || true
                    docker build \\
                      --build-arg NODE_ENV=production \\
                      --build-arg TZ=Asia/Makassar \\
                      --build-arg BETTER_AUTH_URL="https://dashboard.pltdtahuna.my.id/" \\
                      -t ${DOCKER_IMAGE} .
                    docker run -d \\
                      --name ${DOCKER_IMAGE} \\
                      --restart always \\
                      --network host \\
                      -e NODE_ENV=production \\
                      -e TZ=Asia/Makassar \\
                      -e NITRO_HOST=0.0.0.0 \\
                      -e NITRO_PORT=3005 \\
                      --env-file ${ENV_FILE} \\
                      ${DOCKER_IMAGE}
                    '''
                }
            }
        }

        stage('Deploy to Almalinux (Backup)') {
            steps {
                withCredentials([file(credentialsId: 'load-monitor-env', variable: 'ENV_FILE')]) {
                    sh '''
                    unset DOCKER_HOST
                    docker stop ${DOCKER_IMAGE} || true
                    docker rm ${DOCKER_IMAGE} || true
                    docker rmi ${DOCKER_IMAGE} || true
                    docker build \\
                      --build-arg NODE_ENV=production \\
                      --build-arg TZ=Asia/Makassar \\
                      --build-arg BETTER_AUTH_URL="https://dashboard.pltdtahuna.my.id/" \\
                      -t ${DOCKER_IMAGE} .
                    docker run -d \\
                      --name ${DOCKER_IMAGE} \\
                      --restart always \\
                      --network host \\
                      -e NODE_ENV=production \\
                      -e TZ=Asia/Makassar \\
                      -e NITRO_HOST=0.0.0.0 \\
                      -e NITRO_PORT=3005 \\
                      --env-file ${ENV_FILE} \\
                      ${DOCKER_IMAGE}
                    '''
                }
            }
        }
    }
}
