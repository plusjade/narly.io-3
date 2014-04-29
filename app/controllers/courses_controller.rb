class CoursesController < ApplicationController
  def index
    @courses = Course.all
  end

  def show
    @repo = Repo.new(params[:id])
  end

  def steps
    repo = Repo.new(params[:id])
    commit = repo.step(params[:step_id])

    render json: { commit: commit.payload }
  end
end
