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

    respond_to do |format|
      format.html do
        @repo = repo
        @index = commit ? commit.index : 0

        render template: "courses/show"
      end
      format.json do
        render json: { commit: commit.payload }
      end
    end
  end
end
